import { ESLintUtils } from "@typescript-eslint/utils";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "path";

import { MessageIds, Options, name, rule } from "../../src/rules/expect.js";

export const filename = path.join(__dirname, "..", "sandbox", "file.ts");

export const runRuleTests = (
	tests: ESLintUtils.RunTests<MessageIds, [Options?]>,
) => {
	const ruleTester = new RuleTester({
		parser: "@typescript-eslint/parser",
		parserOptions: {
			project: path.join(path.dirname(filename), "tsconfig.json"),
			sourceType: "module",
		},
	});

	ruleTester.run(name, rule, tests);
};
