import type { KnipConfig } from "knip";

export default {
	entry: ["src/**/*.test.*", "src/rules/*.test.ts"],
	ignore: ["src/rules/sandbox/**"],
	ignoreExportsUsedInFile: { interface: true, type: true },
	project: ["src/**/*.ts", "src/**/*.ts!"],
	treatConfigHintsAsErrors: true,
} satisfies KnipConfig;
