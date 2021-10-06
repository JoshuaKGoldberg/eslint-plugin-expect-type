import { rules } from './rules';

const configs = Object.keys(rules).reduce<Record<string, 'error'>>(
  (acc, name) => ({ ...acc, [`expect-type/${name}`]: 'error' as const }),
  {},
);

export = {
  rules,
  configs: {
    recommended: {
      rules: configs,
    },
  },
};
