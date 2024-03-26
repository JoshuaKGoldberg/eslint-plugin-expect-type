import { recommendedRuleSettings } from "./plugin.js";

export { rules } from "./rules/index.js";

export const configs = {
	recommended: {
		plugins: ["expect-type"],
		rules: recommendedRuleSettings,
	},
};
