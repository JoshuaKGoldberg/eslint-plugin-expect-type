/**
 * @file Tests for $ExpectError.
 */
import dedent from 'dedent';
import { runRuleTests } from '../helpers/configs';

runRuleTests({
  valid: [
    {
      code: dedent`
      // $ExpectError
      const t: number = 'a';
    `,
      options: [],
    },
  ],
  invalid: [
    {
      code: dedent`
      // $ExpectError
      const t: number = 5;
    `,
      options: [],
      errors: [
        {
          messageId: 'ExpectedErrorNotFound',
          line: 2,
          column: 1,
        },
      ],
    },
  ],
});
