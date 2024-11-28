// Code based on DefinitelyTyped-tools implementation:
// https://github.com/microsoft/DefinitelyTyped-tools/blob/42484ff245f6f18018de729f12c9a28436daa08a/packages/eslint-plugin/src/rules/expect.ts#L466

import ts from "typescript";

export function normalizedTypeToString(type: string) {
	const sourceFile = ts.createSourceFile(
		"foo.ts",
		`declare var x: ${type};`,
		ts.ScriptTarget.Latest,
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const typeNode = (sourceFile.statements[0] as ts.VariableStatement)
		.declarationList.declarations[0].type!;

	const printer = ts.createPrinter();
	function print(node: ts.Node) {
		return printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
	}

	// TODO: pass undefined instead once https://github.com/microsoft/TypeScript/pull/52941 is released
	const context = ts.nullTransformationContext;

	function visit(node: ts.Node) {
		node = ts.visitEachChild(node, visit, context);

		if (ts.isUnionTypeNode(node)) {
			const types = node.types
				.map((t) => [t, print(t)] as const)
				.sort((a, b) => (a[1] < b[1] ? -1 : 1))
				.map((t) => t[0]);
			return ts.factory.updateUnionTypeNode(
				node,
				ts.factory.createNodeArray(types),
			);
		}

		if (
			ts.isTypeOperatorNode(node) &&
			node.operator === ts.SyntaxKind.ReadonlyKeyword &&
			ts.isArrayTypeNode(node.type)
		) {
			// It's possible that this would conflict with a library which defines their own type with this name,
			// but that's unlikely (and was not previously handled in a prior revision of type string normalization).
			return ts.factory.createTypeReferenceNode("ReadonlyArray", [
				skipTypeParentheses(node.type.elementType),
			]);
		}

		return node;
	}

	const visited = visit(typeNode);
	return print(visited);
}

function skipTypeParentheses(node: ts.TypeNode): ts.TypeNode {
	while (ts.isParenthesizedTypeNode(node)) {
		node = node.type;
	}
	return node;
}
