import { rules } from "./rules/index.js";

export { rules } from "./rules/index.js";

export const configs = {
	recommended: {
		rules: Object.keys(rules).reduce<Record<string, "error">>(
			(acc, name) => ({ ...acc, [`expect-type/${name}`]: "error" as const }),
			{},
		),
	},
};
