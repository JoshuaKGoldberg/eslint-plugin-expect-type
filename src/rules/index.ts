import { TSESLint } from "@typescript-eslint/utils";

import { expect } from "./expect.js";

export const rules: Record<string, TSESLint.RuleModule<string, unknown[]>> = {
	expect,
};
