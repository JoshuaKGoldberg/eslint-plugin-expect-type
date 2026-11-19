import { recommendedRuleSettings } from "./plugin.ts";

export { rules } from "./rules/index.ts";

export const configs = {
	recommended: {
		plugins: ["expect-type"],
		rules: recommendedRuleSettings,
	},
};
