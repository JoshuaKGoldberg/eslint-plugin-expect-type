import { SyntaxError, TwoSlashAssertion } from "./types.js";

export function parseTwoslashAssertion(
	comment: string,
	commentIndex: number,
	commentLine: number,
	sourceText: string,
	lineStarts: readonly number[],
): null | SyntaxError | TwoSlashAssertion {
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
			assertionType: "twoslash",
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

	return {
		assertionType: "twoslash",
		expected,
		expectedPrefix,
		expectedRange,
		insertSpace,
		position,
	};
}
