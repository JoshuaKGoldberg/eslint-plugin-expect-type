import { ESLintUtils, TSESLint } from "@typescript-eslint/utils";
import ts from "typescript";

import { createRule } from "../utils/createRule.js";
import { isDiagnosticWithStart } from "../utils/diagnostics.js";
import { loc } from "../utils/loc.js";
import { getTypeSnapshot, updateTypeSnapshot } from "../utils/snapshot.js";

const messages = {
	ExpectedErrorNotFound: "Expected an error on this line, but found none.",
	FileIsNotIncludedInTsconfig:
		'Expected to find a file "{{ fileName }}" present.',
	Multiple$ExpectTypeAssertions:
		"This line has 2 or more $ExpectType assertions.",
	OrphanAssertion: "Can not match a node to this assertion.",
	SyntaxError: "Syntax Error: {{ message }}",
	TypeSnapshotDoNotMatch:
		"Expected type from Snapshot to be: {{ expected }}, got: {{ actual }}",
	TypeSnapshotNotFound:
		"Type Snapshot not found. Please consider running ESLint in FIX mode: eslint --fix",
	TypesDoNotMatch: "Expected type to be: {{ expected }}, got: {{ actual }}",
};
export type MessageIds = keyof typeof messages;

export interface Options {
	readonly disableExpectTypeSnapshotFix: boolean;
}

const defaultOptions: Options = {
	disableExpectTypeSnapshotFix: false,
};

export const expect = createRule<[Options], MessageIds>({
	create(context, [options]) {
		validate(context, options);

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

function validate(
	context: TSESLint.RuleContext<MessageIds, [Options]>,
	options: Options,
): void {
	const parserServices = ESLintUtils.getParserServices(context);
	const { program } = parserServices;

	const fileName = context.getFilename();
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
			messageId: "FileIsNotIncludedInTsconfig",
		});
		return;
	}

	if (!/\$Expect(Type|Error|^\?)|\^\?/.test(sourceFile.text)) {
		return;
	}

	const checker = program.getTypeChecker();
	const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
	const languageService = ts.createLanguageService(
		getLanguageServiceHost(program),
	);
	const {
		duplicates,
		errorLines,
		syntaxErrors,
		twoSlashAssertions,
		typeAssertions,
	} = parseAssertions(sourceFile);

	for (const line of duplicates) {
		context.report({
			loc: {
				column: 0,
				line: line + 1,
			},
			messageId: "Multiple$ExpectTypeAssertions",
		});
	}

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

	for (const [, assertion] of typeAssertions) {
		if (assertion.assertionType === "snapshot") {
			assertion.expected = getTypeSnapshot(fileName, assertion.snapshotName);
		}
	}

	const { unmetExpectations, unusedAssertions } = getExpectTypeFailures(
		sourceFile,
		{ twoSlashAssertions, typeAssertions },
		checker,
		languageService,
	);
	for (const { actual, assertion, node } of unmetExpectations) {
		const templateDescriptor = {
			data: {
				actual,
				expected: assertion.expected,
			},
			loc: loc(sourceFile, node),
		};
		if (assertion.assertionType === "snapshot") {
			const { snapshotName } = assertion;
			const start = node.getStart();
			const fix = (): TSESLint.RuleFix => {
				let applied = false;
				return {
					range: [start, start],
					// Bug: previously, ESLint would only read RuleFix objects if `--fix` is passed. Now it seems to no matter what.
					// TODO: See if we can only update snapshots if `--fix` is passed?
					// See: https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues/14
					get text() {
						if (!applied) {
							// Make sure we update snapshot only on first read of this object
							applied = true;
							if (!options.disableExpectTypeSnapshotFix) {
								updateTypeSnapshot(fileName, snapshotName, actual);
							}
						}

						return "";
					},
				};
			};

			if (typeof assertion.expected === "undefined") {
				context.report({
					...templateDescriptor,
					fix,
					messageId: "TypeSnapshotNotFound",
				});
			} else {
				context.report({
					...templateDescriptor,
					fix,
					messageId: "TypeSnapshotDoNotMatch",
				});
			}
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

interface TwoSlashAssertion {
	/** The expected type in the twoslash comment */
	expected: string;
	/** Text before the "^?" (used to produce continuation lines for fixer) */
	expectedPrefix: string;
	/** Range of positions corresponding to the "expected" string (for fixer) */
	expectedRange: [number, number];
	/** Does a space need to be added after "^?" when fixing? (If "^?" ends the line.) */
	insertSpace: boolean;
	/** Position in the source file that the twoslash assertion points at */
	position: number;
}

type Assertion =
	| {
			readonly assertionType: "snapshot";
			expected?: string;
			readonly snapshotName: string;
	  }
	| { readonly assertionType: "manual"; expected: string }
	| ({ readonly assertionType: "twoslash" } & TwoSlashAssertion);

interface SyntaxError {
	readonly line: number;
	readonly type:
		| "InvalidTwoslash"
		| "MissingExpectType"
		| "MissingSnapshotName";
}

interface Assertions {
	/** Lines with more than one assertion (these are errors). */
	readonly duplicates: readonly number[];
	/** Lines with an $ExpectError. */
	readonly errorLines: ReadonlySet<number>;
	/** Syntax Errors */
	readonly syntaxErrors: readonly SyntaxError[];
	/** Twoslash-style type assertions in the file */
	readonly twoSlashAssertions: readonly TwoSlashAssertion[];
	/** Map from a line number to the expected type at that line. */
	readonly typeAssertions: Map<number, Assertion>;
}

function parseAssertions(sourceFile: ts.SourceFile): Assertions {
	const errorLines = new Set<number>();
	const typeAssertions = new Map<number, Assertion>();
	const duplicates: number[] = [];
	const syntaxErrors: SyntaxError[] = [];
	const twoSlashAssertions: TwoSlashAssertion[] = [];

	const { text } = sourceFile;
	const commentRegexp = /\/\/(.*)/g;
	const lineStarts = sourceFile.getLineStarts();
	let curLine = 0;

	while (true) {
		const commentMatch = commentRegexp.exec(text);
		if (commentMatch === null) {
			break;
		}

		// Match on the contents of that comment so we do nothing in a commented-out assertion,
		// i.e. `// foo; // $ExpectType number`
		const comment = commentMatch[1];
		const matchExpect = /^ ?\$Expect(TypeSnapshot|Type|Error)( (.*))?$/.exec(
			comment,
		) as [never, "Error" | "Type" | "TypeSnapshot", never, string?] | null;
		const commentIndex = commentMatch.index;
		const line = getLine(commentIndex);
		if (matchExpect) {
			const directive = matchExpect[1];
			const payload = matchExpect[3];
			switch (directive) {
				case "TypeSnapshot":
					const snapshotName = payload;
					if (snapshotName) {
						if (typeAssertions.delete(line)) {
							duplicates.push(line);
						} else {
							typeAssertions.set(line, {
								assertionType: "snapshot",
								snapshotName,
							});
						}
					} else {
						syntaxErrors.push({
							line,
							type: "MissingSnapshotName",
						});
					}

					break;

				case "Error":
					if (errorLines.has(line)) {
						duplicates.push(line);
					}

					errorLines.add(line);
					break;

				case "Type": {
					const expected = payload;
					if (expected) {
						// Don't bother with the assertion if there are 2 assertions on 1 line. Just fail for the duplicate.
						if (typeAssertions.delete(line)) {
							duplicates.push(line);
						} else {
							typeAssertions.set(line, { assertionType: "manual", expected });
						}
					} else {
						syntaxErrors.push({
							line,
							type: "MissingExpectType",
						});
					}

					break;
				}
			}
		} else {
			// Maybe it's a twoslash assertion
			const assertion = parseTwoslashAssertion(
				comment,
				commentIndex,
				line,
				text,
				lineStarts,
			);
			if (assertion) {
				if ("type" in assertion) {
					syntaxErrors.push(assertion);
				} else {
					twoSlashAssertions.push(assertion);
				}
			}
		}
	}

	return {
		duplicates,
		errorLines,
		syntaxErrors,
		twoSlashAssertions,
		typeAssertions,
	};

	function getLine(pos: number): number {
		// advance curLine to be the line preceding 'pos'
		while (lineStarts[curLine + 1] <= pos) {
			curLine++;
		}

		// If this is the first token on the line, it applies to the next line.
		// Otherwise, it applies to the text to the left of it.
		return isFirstOnLine(text, lineStarts[curLine], pos)
			? curLine + 1
			: curLine;
	}
}

function parseTwoslashAssertion(
	comment: string,
	commentIndex: number,
	commentLine: number,
	sourceText: string,
	lineStarts: readonly number[],
): SyntaxError | TwoSlashAssertion | null {
	const matchTwoslash = /^( *)\^\?(.*)$/.exec(comment) as
		| [never, string, string]
		| null;
	if (!matchTwoslash) {
		return null;
	}

	const whitespace = matchTwoslash[1];
	const rawPayload = matchTwoslash[2];
	if (rawPayload.length && !rawPayload.startsWith(" ")) {
		// This is an error: there must be a space after the ^?
		return {
			line: commentLine - 1,
			type: "InvalidTwoslash",
		};
	}

	let expected = rawPayload.slice(1); // strip leading space, or leave it as "".
	if (commentLine === 1) {
		// This will become an attachment error later.
		return {
			expected,
			expectedPrefix: "",
			expectedRange: [-1, -1],
			insertSpace: false,
			position: -1,
		};
	}

	// The position of interest is wherever the "^" (caret) is, but on the previous line.
	const caretIndex = commentIndex + whitespace.length + 2; // 2 = length of "//"
	const position =
		caretIndex - (lineStarts[commentLine - 1] - lineStarts[commentLine - 2]);

	const expectedRange: [number, number] = [
		commentIndex + whitespace.length + 5,
		commentLine < lineStarts.length
			? lineStarts[commentLine] - 1
			: sourceText.length,
	];
	// Peak ahead to the next lines to see if the expected type continues
	const expectedPrefix =
		sourceText.slice(
			lineStarts[commentLine - 1],
			commentIndex + 2 + whitespace.length,
		) + "   ";
	for (let nextLine = commentLine; nextLine < lineStarts.length; nextLine++) {
		const thisLineEnd =
			nextLine + 1 < lineStarts.length
				? lineStarts[nextLine + 1] - 1
				: sourceText.length;
		const lineText = sourceText.slice(lineStarts[nextLine], thisLineEnd + 1);
		if (lineText.startsWith(expectedPrefix)) {
			if (nextLine === commentLine) {
				expected += "\n";
			}

			expected += lineText.slice(expectedPrefix.length);
			expectedRange[1] = thisLineEnd;
		} else {
			break;
		}
	}

	let insertSpace = false;
	if (expectedRange[0] > expectedRange[1]) {
		// this happens if the line ends with "^?" and nothing else
		expectedRange[0] = expectedRange[1];
		insertSpace = true;
	}

	return { expected, expectedPrefix, expectedRange, insertSpace, position };
}

function isFirstOnLine(text: string, lineStart: number, pos: number): boolean {
	for (let i = lineStart; i < pos; i++) {
		if (/\S/.test(text[i])) {
			return false;
		}
	}

	return true;
}

interface UnmetExpectation {
	actual: string;
	assertion: Assertion;
	node: ts.Node;
}

interface ExpectTypeFailures {
	/** Lines with an $ExpectType, but a different type was there. */
	readonly unmetExpectations: readonly UnmetExpectation[];
	/** Lines with an $ExpectType, but no node could be found. */
	readonly unusedAssertions: Iterable<number>;
}

function matchReadonlyArray(actual: string, expected: string) {
	if (!(/\breadonly\b/.test(actual) && /\bReadonlyArray\b/.test(expected))) {
		return false;
	}

	const readonlyArrayRegExp = /\bReadonlyArray</y;
	const readonlyModifierRegExp = /\breadonly /y;

	// A<ReadonlyArray<B<ReadonlyArray<C>>>>
	// A<readonly B<readonly C[]>[]>

	let expectedPos = 0;
	let actualPos = 0;
	let depth = 0;
	while (expectedPos < expected.length && actualPos < actual.length) {
		const expectedChar = expected.charAt(expectedPos);
		const actualChar = actual.charAt(actualPos);
		if (expectedChar === actualChar) {
			expectedPos++;
			actualPos++;
			continue;
		}

		// check for end of readonly array
		if (
			depth > 0 &&
			expectedChar === ">" &&
			actualChar === "[" &&
			actualPos < actual.length - 1 &&
			actual.charAt(actualPos + 1) === "]"
		) {
			depth--;
			expectedPos++;
			actualPos += 2;
			continue;
		}

		// check for start of readonly array
		readonlyArrayRegExp.lastIndex = expectedPos;
		readonlyModifierRegExp.lastIndex = actualPos;
		if (
			readonlyArrayRegExp.test(expected) &&
			readonlyModifierRegExp.test(actual)
		) {
			depth++;
			expectedPos += 14; // "ReadonlyArray<".length;
			actualPos += 9; // "readonly ".length;
			continue;
		}

		return false;
	}

	return true;
}

function getLanguageServiceHost(program: ts.Program): ts.LanguageServiceHost {
	return {
		getCompilationSettings: () => program.getCompilerOptions(),
		getCurrentDirectory: () => program.getCurrentDirectory(),
		getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
		getScriptFileNames: () =>
			program.getSourceFiles().map((sourceFile) => sourceFile.fileName),
		getScriptSnapshot: (name) =>
			ts.ScriptSnapshot.fromString(program.getSourceFile(name)?.text ?? ""),
		getScriptVersion: () => "1",
		// NB: We can't check `program` for files, it won't contain valid files like package.json
		directoryExists: ts.sys.directoryExists,
		fileExists: ts.sys.fileExists,
		getDirectories: ts.sys.getDirectories,
		readDirectory: ts.sys.readDirectory,
		readFile: ts.sys.readFile,
	};
}

function getExpectTypeFailures(
	sourceFile: ts.SourceFile,
	assertions: Pick<Assertions, "twoSlashAssertions" | "typeAssertions">,
	checker: ts.TypeChecker,
	languageService: ts.LanguageService,
): ExpectTypeFailures {
	const { twoSlashAssertions, typeAssertions } = assertions;

	const unmetExpectations: UnmetExpectation[] = [];
	// Match assertions to the first node that appears on the line they apply to.
	// `forEachChild` isn't available as a method in older TypeScript versions, so must use `ts.forEachChild` instead.
	ts.forEachChild(sourceFile, function iterate(node) {
		const line = lineOfPosition(node.getStart(sourceFile), sourceFile);
		const assertion = typeAssertions.get(line);
		if (assertion !== undefined) {
			const { expected } = assertion;

			let nodeToCheck = node;

			// https://github.com/Microsoft/TypeScript/issues/14077
			if (node.kind === ts.SyntaxKind.ExpressionStatement) {
				node = (node as ts.ExpressionStatement).expression;
			}

			nodeToCheck = getNodeForExpectType(node);
			const type = checker.getTypeAtLocation(nodeToCheck);
			const actual = type
				? checker.typeToString(
						type,
						/*enclosingDeclaration*/ undefined,
						ts.TypeFormatFlags.NoTruncation,
				  )
				: "";

			if (
				!expected ||
				(actual !== expected && !matchReadonlyArray(actual, expected))
			) {
				unmetExpectations.push({ actual, assertion, node });
			}

			typeAssertions.delete(line);
		}

		ts.forEachChild(node, iterate);
	});

	const twoSlashFailureLines: number[] = [];
	if (twoSlashAssertions.length) {
		for (const assertion of twoSlashAssertions) {
			const { expected, position } = assertion;
			if (position === -1) {
				// special case for a twoslash assertion on line 1.
				twoSlashFailureLines.push(0);
				continue;
			}

			const node = getNodeAtPosition(sourceFile, position);
			if (!node) {
				twoSlashFailureLines.push(
					sourceFile.getLineAndCharacterOfPosition(position).line,
				);
				continue;
			}

			const qi = languageService.getQuickInfoAtPosition(
				sourceFile.fileName,
				node.getStart(),
			);
			if (!qi?.displayParts) {
				twoSlashFailureLines.push(
					sourceFile.getLineAndCharacterOfPosition(position).line,
				);
				continue;
			}

			const actual = qi.displayParts.map((dp) => dp.text).join("");
			if (!matchModuloWhitespace(actual, expected)) {
				unmetExpectations.push({
					actual,
					assertion: { assertionType: "twoslash", ...assertion },
					node,
				});
			}
		}
	}

	return {
		unmetExpectations,
		unusedAssertions: [...twoSlashFailureLines, ...typeAssertions.keys()],
	};
}

function getNodeAtPosition(
	sourceFile: ts.SourceFile,
	position: number,
): ts.Node | undefined {
	let candidate: ts.Node | undefined = undefined;
	ts.forEachChild(sourceFile, function iterate(node) {
		const start = node.getStart();
		const end = node.getEnd();
		if (position >= start && position <= end) {
			candidate = node;
			ts.forEachChild(node, iterate);
		}
	});
	return candidate;
}

function matchModuloWhitespace(actual: string, expected: string): boolean {
	// TODO: it's much easier to normalize actual based on the displayParts
	//       This isn't 100% correct if a type has a space in it, e.g. type T = "string literal"
	const normActual = actual.replace(/[\n\r ]+/g, " ").trim();
	const normExpected = expected.replace(/[\n\r ]+/g, " ").trim();
	return normActual === normExpected;
}

function getNodeForExpectType(node: ts.Node): ts.Node {
	if (node.kind === ts.SyntaxKind.VariableStatement) {
		// ts2.0 doesn't have `isVariableStatement`
		const {
			declarationList: { declarations },
		} = node as ts.VariableStatement;
		if (declarations.length === 1) {
			const { initializer } = declarations[0];
			if (initializer) {
				return initializer;
			}
		}
	}

	return node;
}

function lineOfPosition(pos: number, sourceFile: ts.SourceFile): number {
	return sourceFile.getLineAndCharacterOfPosition(pos).line;
}
