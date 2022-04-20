/**
 * @file Tests for $ExpectError.
 */
import dedent from 'dedent';
import { filename, runRuleTests } from '../helpers/configs';

runRuleTests({
  valid: [
    {
      code: dedent`
      // $ExpectError
      const t: number = 'a';
    `,
      filename,
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
      filename,
    },
  ],
});
