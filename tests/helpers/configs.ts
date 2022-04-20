import { ESLintUtils, TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import { MessageIds, name, Options, rule } from '../../src/rules/expect';

const sandboxDirectory = path.join(__dirname, '../sandbox');

export const filename = path.join(sandboxDirectory, 'file.ts');
export const filenameDts = path.join(sandboxDirectory, 'types.d.ts');

export const runRuleTests = (tests: TSESLint.RunTests<MessageIds, [Options?]>) => {
  const ruleTester = new ESLintUtils.RuleTester({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      sourceType: 'module',
      project: path.join(sandboxDirectory, 'tsconfig.json'),
    },
  });

  return ruleTester.run(name, rule, tests);
};
