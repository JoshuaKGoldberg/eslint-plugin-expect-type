import { expectType } from "./rules";

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
