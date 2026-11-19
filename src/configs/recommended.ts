import { plugin, recommendedRuleSettings } from "../plugin.ts";

const recommended = {
	plugins: {
		"expect-type": plugin,
	},
	rules: recommendedRuleSettings,
};

export default recommended;
