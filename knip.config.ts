import type { KnipConfig } from "knip";

export default {
	entry: ["src/**/*.test.*", "src/rules/*.test.ts"],
	ignoreDependencies: ["@typescript-eslint/parser"],
	ignoreExportsUsedInFile: { interface: true, type: true },
	project: ["src/**/*.ts", "src/**/*.ts!"],
	treatConfigHintsAsErrors: true,
} satisfies KnipConfig;
