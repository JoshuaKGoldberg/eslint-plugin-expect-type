import { TSESLint } from "@typescript-eslint/experimental-utils";
import { expectType } from "./rules";

/** We just use this for intellisense */
const createPlugin = (obj: {
  configs: {
    [s: string]: { rules: { [a: string]: "error" | "warn" | "off" } };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: { [s: string]: TSESLint.RuleModule<any, any, any> };
}) => {
  // const ruleNames = new Set<string>();
  // const { rules, configs } = obj;

  // for (const ruleName in rules) {
  //   ruleNames.add(ruleName);
  //   const url = rules[ruleName].meta.docs.url;
  //   if (ruleName !== url) {
  //     throw new Error(
  //       `Name mismatch in eslint-plugin-roblox-ts: ${ruleName} vs ${url}`
  //     );
  //   }
  // }

  // for (const configName in configs) {
  //   for (const ruleName in configs[configName].rules) {
  //     if (
  //       ruleName.startsWith("roblox-ts/") &&
  //       !ruleNames.has(ruleName.slice(10))
  //     ) {
  //       throw new Error(
  //         `${ruleName} is not a valid rule defined in eslint-plugin-roblox-ts! Try one of the following: ` +
  //           [...ruleNames].join(", ")
  //       );
  //     }
  //   }
  // }
  return obj;
};

export = {
  rules: {
    "expect-type": expectType
  },
  configs: {
    recommended: {
      rules: {
        "expect-type/expect-type": "error"
      }
    }
  }
};
