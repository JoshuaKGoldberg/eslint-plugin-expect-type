import { TSESLint } from "@typescript-eslint/utils";

import { expect } from "./expect.js";

// https://github.com/typescript-eslint/typescript-eslint/issues/7605
export const rules: Record<string, TSESLint.RuleModule<string, unknown[]>> = {
	expect,
};
