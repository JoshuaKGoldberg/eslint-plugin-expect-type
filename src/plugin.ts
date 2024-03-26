import { createRequire } from "node:module";

import { rules } from "./rules/index.js";

const require = createRequire(import.meta.url || __filename);

const { name, version } = require("../package.json") as {
	name: string;
	version: string;
};

export const plugin = {
	meta: {
		name,
		version,
	},
	rules,
};

export const recommendedRuleSettings = Object.fromEntries(
	Object.entries(rules).map(([name]) => [
		"expect-type/" + name,
		"error" as const,
	]),
);
