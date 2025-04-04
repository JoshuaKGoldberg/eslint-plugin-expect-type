import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		coverage: {
			all: true,
			exclude: ["src/index.ts", "src/rules/index.ts"],
			include: ["src"],
			reporter: ["html", "lcov"],
		},
		exclude: ["lib", "node_modules", "src/index.ts", "src/rules/index.ts"],
		setupFiles: ["console-fail-test/setup"],
	},
});
