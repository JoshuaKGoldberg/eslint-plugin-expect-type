import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "path";
import * as vitest from "vitest";

export const tsconfigRootDir = path.join(__dirname, "sandbox");

export const filename = path.join(tsconfigRootDir, "file.ts");

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

export const ruleTester = new RuleTester({
	languageOptions: {
		parserOptions: {
			projectService: true,
			tsconfigRootDir,
		},
	},
});
