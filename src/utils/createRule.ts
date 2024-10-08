import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator<{
	requiresTypeChecking?: boolean;
}>(
	(name) =>
		`https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/main/docs/rules/${name}.md`,
);
