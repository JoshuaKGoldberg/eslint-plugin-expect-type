import { Node, SourceFile } from "typescript";

export const loc = (sourceFile: SourceFile, node: Node) => {
	const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
	const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
	return {
		end: {
			column: end.character,
			line: end.line + 1,
		},
		start: {
			column: start.character,
			line: start.line + 1,
		},
	};
};
