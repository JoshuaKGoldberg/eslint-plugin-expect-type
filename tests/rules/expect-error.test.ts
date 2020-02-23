/**
 * @file Tests for $ExpectError.
 */
import dedent from 'dedent';
import { RuleTester, Rule } from 'eslint';
import { typescript } from '../helpers/configs';
import { InvalidTestCase, processInvalidTestCase, processValidTestCase, ValidTestCase } from '../helpers/util';
import { name, rule } from '../../src/rules/expect';

// Valid test cases.
const valid: ReadonlyArray<ValidTestCase> = [
  {
    code: dedent`
      // $ExpectError
      const t: number = 'a';
    `,
    optionsSet: [[]],
  },
];

// Invalid test cases.
const invalid: ReadonlyArray<InvalidTestCase> = [
  {
    code: dedent`
      // $ExpectError
      const t: number = 5;
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'ExpectedErrorNotFound',
        line: 2,
        column: 1,
      },
    ],
  },
];

describe('$ExpectError', () => {
  const ruleTester = new RuleTester(typescript);
  ruleTester.run(name, rule as Rule.RuleModule, {
    valid: processValidTestCase(valid),
    invalid: processInvalidTestCase(invalid),
  });
});
