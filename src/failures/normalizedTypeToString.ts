// Code based on DefinitelyTyped-tools implementation:
// https://github.com/microsoft/DefinitelyTyped-tools/blob/42484ff245f6f18018de729f12c9a28436daa08a/packages/eslint-plugin/src/rules/expect.ts#L466

import type ts from "typescript";

import { TSModule } from "../utils/programs.js";

export function normalizedTypeToString(type: string, tsModule: TSModule) {
	const sourceFile = tsModule.createSourceFile(
		"foo.ts",
		`declare var x: ${type};`,
		tsModule.ScriptTarget.Latest,
	);
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const typeNode = (sourceFile.statements[0] as ts.VariableStatement)
		.declarationList.declarations[0].type!;

	const printer = tsModule.createPrinter();
	function print(node: ts.Node) {
		return printer.printNode(tsModule.EmitHint.Unspecified, node, sourceFile);
	}

	// TODO: pass undefined instead once all supported TS versions support it per:
	// https://github.com/microsoft/TypeScript/pull/52941
	const context = tsModule.nullTransformationContext;

	function visit(node: ts.Node) {
		node = tsModule.visitEachChild(node, visit, context);

		if (tsModule.isUnionTypeNode(node)) {
			const types = node.types
				.map((t) => [t, print(t)] as const)
				.sort((a, b) => (a[1] < b[1] ? -1 : 1))
				.map((t) => t[0]);
			return tsModule.factory.updateUnionTypeNode(
				node,
				tsModule.factory.createNodeArray(types),
			);
		}

		if (
			tsModule.isTypeOperatorNode(node) &&
			node.operator === tsModule.SyntaxKind.ReadonlyKeyword &&
			tsModule.isArrayTypeNode(node.type)
		) {
			// It's possible that this would conflict with a library which defines their own type with this name,
			// but that's unlikely (and was not previously handled in a prior revision of type string normalization).
			return tsModule.factory.createTypeReferenceNode("ReadonlyArray", [
				skipTypeParentheses(node.type.elementType),
			]);
		}

		return node;
	}

	const visited = visit(typeNode);
	return print(visited);

	function skipTypeParentheses(node: ts.TypeNode): ts.TypeNode {
		while (tsModule.isParenthesizedTypeNode(node)) {
			node = node.type;
		}
		return node;
	}
}
