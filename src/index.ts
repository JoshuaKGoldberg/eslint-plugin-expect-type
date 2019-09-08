import { expectType } from './rules';

export = {
  rules: {
    rule: expectType,
  },
  configs: {
    recommended: {
      rules: {
        'expect-type/rule': 'error',
      },
    },
  },
};
