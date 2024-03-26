import { plugin, recommendedRuleSettings } from "../plugin.js";

const recommended = {
	plugins: {
		"expect-type": plugin,
	},
	rules: recommendedRuleSettings,
};

export default recommended;
