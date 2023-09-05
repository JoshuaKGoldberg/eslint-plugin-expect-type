import { ESLintUtils } from "@typescript-eslint/utils";

// https://github.com/typescript-eslint/typescript-eslint/issues/7605
export const createRule: ReturnType<typeof ESLintUtils.RuleCreator> =
	ESLintUtils.RuleCreator(
		(name) =>
			`https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/main/docs/rules/${name}.md`,
	);
