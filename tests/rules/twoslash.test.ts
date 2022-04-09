import dedent from 'dedent';
import { RuleTester, Rule } from 'eslint';
import { typescript } from '../helpers/configs';
import { InvalidTestCase, processInvalidTestCase, processValidTestCase, ValidTestCase } from '../helpers/util';
import { name, rule } from '../../src/rules/expect';

// Valid test cases.
const valid: ReadonlyArray<ValidTestCase> = [
  // Twoslash
  {
    code: dedent`
      const t = { a: 17, b: 'on' as const };
      //    ^? const t: { a: number; b: "on"; }
    `,
    optionsSet: [[]],
  },
  // Twoslash type from #4
  {
    code: dedent`
      const square = (x: number) => x * x;
      const four = square(2);
      //    ^? const four: number
    `,
    optionsSet: [[]],
  },
];

// Invalid test cases.
const invalid: ReadonlyArray<InvalidTestCase> = [
  {
    code: dedent`
      const square = (x: number) => x * x;
      const four = square(2);
      //    ^? const four: string
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 2,
        column: 7,
      },
    ],
  },
];

describe('TwoSlash', () => {
  const ruleTester = new RuleTester(typescript);
  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid),
    invalid: processInvalidTestCase(invalid),
  });
});
