import * as ts from "typescript";

export const locForTSNode = (sourceFile: ts.SourceFile, node: ts.Node) => {
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

export function lineOfPosition(pos: number, sourceFile: ts.SourceFile): number {
	return sourceFile.getLineAndCharacterOfPosition(pos).line;
}

export function getNodeAtPosition(
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
