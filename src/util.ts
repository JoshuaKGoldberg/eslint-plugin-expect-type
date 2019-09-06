import { ESLintUtils, ParserServices, TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
// import ts from "typescript";

export const createRule = ESLintUtils.RuleCreator(name => name);


// export type ExpressionWithTest =
// 	| TSESTree.ConditionalExpression
// 	| TSESTree.DoWhileStatement
// 	| TSESTree.ForStatement
// 	| TSESTree.IfStatement
// 	| TSESTree.WhileStatement;

// export type RequiredParserServices = { [k in keyof ParserServices]: Exclude<ParserServices[k], undefined> };

// /**
//  * Try to retrieve typescript parser service from context
//  */
// export function getParserServices<TMessageIds extends string, TOptions extends Array<unknown>>(
// 	context: TSESLint.RuleContext<TMessageIds, TOptions>,
// ): RequiredParserServices {
// 	if (!context.parserServices || !context.parserServices.program || !context.parserServices.esTreeNodeToTSNodeMap) {
// 		/**
// 		 * The user needs to have configured "project" in their parserOptions
// 		 * for @typescript-eslint/parser
// 		 */
// 		throw new Error(
// 			'You have used a rule which requires parserServices to be generated. You must therefore provide a value for the "parserOptions.project" property for @typescript-eslint/parser.',
// 		);
// 	}
// 	return context.parserServices as RequiredParserServices;
// }

// /**
//  * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
//  */
// export function getConstrainedTypeAtLocation(checker: ts.TypeChecker, node: ts.Node): ts.Type {
// 	const nodeType = checker.getTypeAtLocation(node);
// 	const constrained = checker.getBaseConstraintOfType(nodeType);

// 	return constrained || nodeType;
// }
