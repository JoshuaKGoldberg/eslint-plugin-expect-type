import { rules } from './rules';

const configs = Object.keys(rules).reduce(
  (acc, name) => ({ ...acc, [`expect-type/${name}`]: 'error' as const }),
  {} as Record<string, 'error'>,
);

export = {
  rules,
  configs: {
    recommended: {
      rules: configs,
    },
  },
};
