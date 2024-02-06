import { TSESLint } from "@typescript-eslint/utils";
import ts from "typescript";

import { parseAssertions } from "../assertions/parseAssertions.js";
import { SyntaxError } from "../assertions/types.js";
import { getExpectTypeFailures } from "../failures/getExpectTypeFailures.js";
import { UnmetExpectation } from "../failures/types.js";
import {
	ExpectRuleContext,
	MessageIds,
	Options,
	defaultOptions,
	messages,
} from "../meta.js";
import { createRule } from "../utils/createRule.js";
import { isDiagnosticWithStart } from "../utils/diagnostics.js";
import { lineOfPosition, locForTSNode } from "../utils/locations.js";
import { updateTypeSnapshot } from "../utils/snapshot.js";
import { resolveVersionsToTest } from "../utils/versions.js";

export const expect = createRule<[Options], MessageIds>({
	create(context, [options]) {
		// Performance: if the source file doesn't have any triggering comments,
		// avoid asking for diagnostics or type information altogether.
		if (!/\$Expect(?:Type|Error|\?)|\^\?/.test(context.sourceCode.text)) {
			return {};
		}

		const versionsResolution = resolveVersionsToTest(
			context,
			options.versionsToTest,
		);

		if (versionsResolution.error) {
			context.report({
				...versionsResolution.error,
				loc: {
					end: { column: 0, line: 0 },
					start: { column: 0, line: 0 },
				},
			});
			return {};
		}

		for (const { program, sourceFile } of versionsResolution.versions) {
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
		}

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
		schema: {
			$defs: {
				version: {
					additionalProperties: false,
					properties: {
						name: { required: true, type: "string" },
						path: { required: true, type: "string" },
					},
					type: "object",
				},
			},
			items: [
				{
					additionalProperties: false,
					properties: {
						disableExpectTypeSnapshotFix: {
							type: "boolean",
						},
						versions: {
							items: { $ref: "#/$defs/version" },
							type: "array",
						},
					},
					type: "object",
				},
			],
			type: "array",
		},
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
											context.getFilename(),
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
