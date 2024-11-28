import ts from "typescript";

import { getTypeSnapshot } from "../utils/snapshot.js";
import { parseTwoslashAssertion } from "./parseTwoslashAssertion.js";
import { Assertion, TwoSlashAssertion } from "./types.js";
import { Assertions, SyntaxError } from "./types.js";

export function parseAssertions(sourceFile: ts.SourceFile): Assertions {
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
		// eslint-disable-next-line regexp/no-unused-capturing-group
		const matchExpect = /^ ?\$Expect(TypeSnapshot|Type|Error)( (.*))?$/.exec(
			comment,
		) as [never, "Error" | "Type" | "TypeSnapshot", never, string?] | null;
		const commentIndex = commentMatch.index;
		const line = getLine(commentIndex);
		if (matchExpect) {
			const directive = matchExpect[1];
			const payload = matchExpect[3];
			switch (directive) {
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

				case "TypeSnapshot": {
					const snapshotName = payload;
					if (snapshotName) {
						if (typeAssertions.delete(line)) {
							duplicates.push(line);
						} else {
							typeAssertions.set(line, {
								assertionType: "snapshot",
								expected: getTypeSnapshot(sourceFile.fileName, snapshotName),
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

function isFirstOnLine(text: string, lineStart: number, pos: number): boolean {
	for (let i = lineStart; i < pos; i++) {
		if (/\S/.test(text[i])) {
			return false;
		}
	}

	return true;
}
