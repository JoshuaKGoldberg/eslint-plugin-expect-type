import { defineConfig } from "tsdown";

export default defineConfig({
	cjsDefault: false,
	entry: [
		"src/index.ts",
		"src/configs/recommended.ts",
		"!src/**/*.test.*",
		"!src/rules/ruleTester.ts",
		"!src/rules/sandbox/**",
	],
	format: ["cjs", "esm"],
	unbundle: true,
});
