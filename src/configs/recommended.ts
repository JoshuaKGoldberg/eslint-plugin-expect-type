import type { ESLint } from "eslint";

import { plugin, recommendedRuleSettings } from "../plugin.ts";

const recommended = {
	plugins: {
		"expect-type": plugin as unknown as ESLint.Plugin,
	},
	rules: recommendedRuleSettings,
};

export default recommended;
