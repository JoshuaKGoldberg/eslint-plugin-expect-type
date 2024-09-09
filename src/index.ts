import { plugin, recommendedRuleSettings } from "./plugin.js";

export { rules } from "./rules/index.js";

export const configs = {
	recommended: {
		plugins: {
			"expect-type": plugin,
		},
		rules: recommendedRuleSettings,
	},
};
