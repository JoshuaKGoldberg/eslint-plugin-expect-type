import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"src/**/*.ts",
		"!src/**/*.test.*",
		"!src/rules/ruleTester.ts",
		"!src/rules/sandbox/**",
	],
	format: ["cjs", "esm"],
	unbundle: true,
});
