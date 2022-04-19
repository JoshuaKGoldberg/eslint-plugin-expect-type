import { ESLintUtils, TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import { MessageIds, name, Options, rule } from '../../src/rules/expect';

export const filename = path.join(__dirname, '..', 'sandbox', 'file.ts');

export const runRuleTests = (tests: TSESLint.RunTests<MessageIds, [Options?]>) => {
  const ruleTester = new ESLintUtils.RuleTester({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module',
      project: path.join(path.dirname(filename), 'tsconfig.json'),
    },
  });

  return ruleTester.run(name, rule, tests);
};
