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
  // Multiline twoslash
  {
    code: dedent`
      const t = { a: 17, b: 'on' as const };
      //    ^? const t: {
      //         a: number;
      //         b: "on";
      //       }
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
    output: dedent`
      const square = (x: number) => x * x;
      const four = square(2);
      //    ^? const four: number
    `,
  },
  // Fixer for comment that doesn't continue the twoslash comment
  {
    code: dedent`
      const square = (x: number) => x * x;
      const four = square(2);
      //    ^? const four: string
      // not the last line.
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 2,
        column: 7,
      },
    ],
    output: dedent`
      const square = (x: number) => x * x;
      const four = square(2);
      //    ^? const four: number
      // not the last line.
    `,
  },
  // While whitespace is ignored, field order does matter.
  {
    code: dedent`
      const t = { a: 17, b: 'on' as const };
      //    ^? const t: {
      //         b: "on";
      //         a: number;
      //       }
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 1,
        column: 7,
      },
    ],
    output: dedent`
      const t = { a: 17, b: 'on' as const };
      //    ^? const t: {
      //           a: number;
      //           b: "on";
      //       }
    `,
  },
  {
    code: dedent`
      const square = (x: number) => x * x;
      const four = square(2);
      // ^? const four: string
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'OrphanAssertion',
        line: 2,
        column: 1,  // would column 3 be better?
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
