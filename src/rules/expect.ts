import { ESLintUtils, TSESLint } from "@typescript-eslint/utils";
import ts from "typescript";

import { parseAssertions } from "../assertions/parseAssertions.js";
import { SyntaxError } from "../assertions/types.js";
import { getExpectTypeFailures } from "../failures/getExpectTypeFailures.js";
import { UnmetExpectation } from "../failures/types.js";
import { createRule } from "../utils/createRule.js";
import { isDiagnosticWithStart } from "../utils/diagnostics.js";
import { lineOfPosition, locForTSNode } from "../utils/locations.js";
import { updateTypeSnapshot } from "../utils/snapshot.js";

const messages = {
	ExpectedErrorNotFound: "Expected an error on this line, but found none.",
	FileIsNotIncludedInTSConfig:
		'Expected to find a file "{{ fileName }}" present.',
	Multiple$ExpectTypeAssertions:
		"This line has 2 or more $ExpectType assertions.",
	OrphanAssertion: "Can not match a node to this assertion.",
	SyntaxError: "Syntax Error: {{ message }}",
	TypesDoNotMatch: "Expected type to be: {{ expected }}, got: {{ actual }}",
	TypeSnapshotDoNotMatch:
		"Expected type from Snapshot to be: {{ expected }}, got: {{ actual }}",
	TypeSnapshotNotFound:
		"Type Snapshot not found. Please consider running ESLint in FIX mode: eslint --fix",
};

export type MessageIds = keyof typeof messages;

export interface Options {
	readonly disableExpectTypeSnapshotFix: boolean;
}

const defaultOptions: Options = {
	disableExpectTypeSnapshotFix: false,
};

type ExpectRuleContext = TSESLint.RuleContext<MessageIds, [Options]>;

export const expect = createRule<[Options], MessageIds>({
	create(context, [options]) {
		const parserServices = ESLintUtils.getParserServices(context);
		const { program } = parserServices;

		// TODO: Once ESLint <8 support is removed, soon
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		const fileName = context.filename || context.getFilename();
		const sourceFile = program.getSourceFile(fileName);
		if (!sourceFile) {
			context.report({
				data: {
					fileName,
				},
				loc: {
					column: 0,
					line: 1,
				},
				messageId: "FileIsNotIncludedInTSConfig",
			});
			return {};
		}

		// Performance: if the source file doesn't have any triggering comments,
		// avoid asking for diagnostics or type information altogether.
		if (!/\$Expect(?:Type|Error|\?)|\^\?/.test(sourceFile.text)) {
			return {};
		}

		const {
			duplicates,
			errorLines,
			syntaxErrors,
			twoSlashAssertions,
			typeAssertions,
		} = parseAssertions(sourceFile);

		reportDuplicates(context, duplicates);
		reportNotFoundErrors(context, errorLines, program, sourceFile);
		reportSyntaxErrors(context, syntaxErrors);

		const { unmetExpectations, unusedAssertions } = getExpectTypeFailures(
			sourceFile,
			{ twoSlashAssertions, typeAssertions },
			program,
		);

		reportUnmetExpectations(context, options, unmetExpectations, sourceFile);
		reportUnusedAssertions(context, unusedAssertions);

		return {};
	},
	defaultOptions: [defaultOptions],
	meta: {
		docs: {
			description: "Expects type error, type snapshot, or type.",
			requiresTypeChecking: true,
		},
		fixable: "code",
		messages,
		schema: [
			{
				additionalProperties: false,
				properties: {
					disableExpectTypeSnapshotFix: {
						type: "boolean",
					},
				},
				type: "object",
			},
		],
		type: "problem",
	},
	name: "expect",
});

function reportDuplicates(
	context: ExpectRuleContext,
	duplicates: readonly number[],
) {
	for (const line of duplicates) {
		context.report({
			loc: {
				column: 0,
				line: line + 1,
			},
			messageId: "Multiple$ExpectTypeAssertions",
		});
	}
}

function reportNotFoundErrors(
	context: ExpectRuleContext,
	errorLines: ReadonlySet<number>,
	program: ts.Program,
	sourceFile: ts.SourceFile,
) {
	const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
	const seenDiagnosticsOnLine = new Set(
		diagnostics
			.filter(isDiagnosticWithStart)
			.map((diagnostic) => lineOfPosition(diagnostic.start, sourceFile)),
	);

	for (const line of errorLines) {
		if (!seenDiagnosticsOnLine.has(line)) {
			context.report({
				loc: {
					column: 0,
					line: line + 1,
				},
				messageId: "ExpectedErrorNotFound",
			});
		}
	}
}

function reportSyntaxErrors(
	context: ExpectRuleContext,
	syntaxErrors: readonly SyntaxError[],
) {
	for (const { line, type } of syntaxErrors) {
		context.report({
			data: {
				message:
					type === "MissingExpectType"
						? '$ExpectType requires type argument (e.g. // $ExpectType "string")'
						: type === "MissingSnapshotName"
							? "$ExpectTypeSnapshot requires snapshot name argument (e.g. // $ExpectTypeSnapshot MainComponentAPI)"
							: 'Invalid twoslash assertion; make sure there is a space after the "^?".',
			},
			loc: {
				column: 0,
				line: line + 1,
			},
			messageId: "SyntaxError",
		});
	}
}

function reportUnmetExpectations(
	context: ExpectRuleContext,
	options: Options,
	unmetExpectations: readonly UnmetExpectation[],
	sourceFile: ts.SourceFile,
) {
	for (const { actual, assertion, node } of unmetExpectations) {
		const templateDescriptor = {
			data: {
				actual,
				expected: assertion.expected,
			},
			loc: locForTSNode(sourceFile, node),
		};
		if (assertion.assertionType === "snapshot") {
			const { snapshotName } = assertion;
			const start = node.getStart();

			context.report({
				...templateDescriptor,

				// ESLint doesn't indicate whether it's in --fix mode, and fixers run immediately.
				// We don't have a way to delay file updates natively in ESLint.
				// Instead, we use this inaccurate heuristic to know if we're in CLI --fix...
				// See: https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues/14
				fix: process.argv.includes("--fix")
					? (): TSESLint.RuleFix => {
							return {
								range: [start, start],
								get text() {
									if (!options.disableExpectTypeSnapshotFix) {
										updateTypeSnapshot(
											// TODO: Once ESLint <8 support is removed, soon
											// eslint-disable-next-line @typescript-eslint/no-deprecated
											context.filename || context.getFilename(),
											snapshotName,
											actual,
										);
									}

									return "";
								},
							};
						}
					: undefined,

				messageId:
					typeof assertion.expected === "undefined"
						? "TypeSnapshotNotFound"
						: "TypeSnapshotDoNotMatch",
			});
		} else {
			context.report({
				...templateDescriptor,
				messageId: "TypesDoNotMatch",
				...(assertion.assertionType === "twoslash"
					? {
							fix: (): TSESLint.RuleFix => {
								const { expectedPrefix, expectedRange, insertSpace } =
									assertion;
								return {
									range: expectedRange,
									text:
										(insertSpace ? " " : "") +
										actual
											.split("\n")
											.map((line, i) => (i > 0 ? expectedPrefix + line : line))
											.join("\n"),
								};
							},
						}
					: {}),
			});
		}
	}
}

function reportUnusedAssertions(
	context: ExpectRuleContext,
	unusedAssertions: Iterable<number>,
) {
	for (const line of unusedAssertions) {
		context.report({
			loc: {
				column: 0,
				line: line + 1,
			},
			messageId: "OrphanAssertion",
		});
	}
}
