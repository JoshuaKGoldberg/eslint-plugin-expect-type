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
  // Multiline twoslash with another comment after it.
  {
    code: dedent`
      const t = { a: 17, b: 'on' as const };
      //    ^? const t: {
      //         a: number;
      //         b: "on";
      //       }
      // This is an unrelated, non-twoslash comment.
    `,
    optionsSet: [[]],
  },
  // Test for a type alias
  {
    code: dedent`
      type MyType = 123;
      //   ^? type MyType = 123
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
  // Offers a fix for an empty assertion (the usual starting point)
  {
    code: dedent`
      const four = 4;
      //    ^?
      // next line
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
      const four = 4;
      //    ^? const four: 4
      // next line
    `,
  },
  // Same as previous, but with a space already present after the ^?
  {
    code:
      dedent`
      const four = 4;
      //    ^?` + ' ',
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 1,
        column: 7,
      },
    ],
    output: dedent`
      const four = 4;
      //    ^? const four: 4
    `,
  },
  // no space after "^?"
  {
    code: dedent`
      type MyType = 123;
      //   ^?type MyType = 123
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'SyntaxError',
        line: 2,
        column: 1,
      },
    ],
  },
  // Two twoslash assertions on a single line. Only the first one is used.
  {
    code: dedent`
      let x = 4, y = "four";
      //  ^?     ^? let y: string
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 1,
        column: 5,
      },
    ],
    output: dedent`
      let x = 4, y = "four";
      //  ^? let x: number
    `,
  },
  // Fixer for comment that doesn't continue the twoslash comment
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
  // Same as above but not the last line of the file
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
  // A single line assertion can become a multiline after fixing.
  {
    code: dedent`
      const t = { a: 17, b: 'on' as const };
      //    ^? const t: boolean
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
  // A multiline assertion can become a single line after fixing.
  {
    code: dedent`
      let four = 4;
      //    ^? let four: {
      //           a: number;
      //           b: "on";
      //       }
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'TypesDoNotMatch',
        line: 1,
        column: 5,
      },
    ],
    output: dedent`
      let four = 4;
      //    ^? let four: number
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
        column: 1,
      },
    ],
  },
  {
    code: dedent`
      const four = 4;  // intentional blank below!

      // ^? const four: number
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'OrphanAssertion',
        line: 3,
        column: 1,
      },
    ],
  },
  // Can't have an assertion on the first line of a file.
  {
    code: dedent`
      // ^? const four: number
      const four = 4;
    `,
    optionsSet: [[]],
    errors: [
      {
        messageId: 'OrphanAssertion',
        line: 1,
        column: 1,
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
