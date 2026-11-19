import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		coverage: {
			exclude: ["lib"],
			include: ["src/**/*.ts", "src"],
			reporter: ["html", "lcov"],
		},
		exclude: ["dist", "lib", "node_modules"],
		setupFiles: ["console-fail-test/setup"],
	},
});
