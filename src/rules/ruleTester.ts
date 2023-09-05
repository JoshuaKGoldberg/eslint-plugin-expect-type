import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "path";

export const filename = path.join(__dirname, "file.ts");

export const ruleTester = new RuleTester({
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: path.join(path.dirname(filename), "tsconfig.json"),
		sourceType: "module",
	},
});
