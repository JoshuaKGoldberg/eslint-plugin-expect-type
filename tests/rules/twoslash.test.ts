import dedent from 'dedent';

import { filename, runRuleTests } from '../helpers/configs';

runRuleTests({
  valid: [
    // Twoslash
    {
      code: dedent`
        const t = { a: 17, b: 'on' as const };
        //    ^? const t: { a: number; b: "on"; }
      `,
      filename,
      options: [],
    },
    {
      code: dedent`
      let val = 9001;
      //  ^? let val: number
      `,
      filename,
      options: [],
    },
    // Twoslash type from #4
    {
      code: dedent`
        const square = (x: number) => x * x;
        const four = square(2);
        //    ^? const four: number
      `,
      filename,
      options: [],
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
      filename,
      options: [],
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
      filename,
      options: [],
    },
    // Test for a type alias
    {
      code: dedent`
        type MyType = 123;
        //   ^? type MyType = 123
      `,
      filename,
      options: [],
    },
    // Make sure we handle path mappings in package.json
    {
      code: dedent`
        import { FooString } from "./package";
        type Bar = FooString | number;
        //   ^? type Bar = string | number
      `,
      filename,
      options: [],
    },
    // Tab indentation: #64
    {
      code: `
	const bar = {"test": 123}
	//    ^? const bar: { test: number; }
      `,
      filename,
    },
  ],
  invalid: [
    {
      code: dedent`
        const square = (x: number) => x * x;
        const four = square(2);
        //    ^? const four: string
      `,
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 2,
          column: 7,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 1,
          column: 7,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 1,
          column: 7,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'SyntaxError',
          line: 2,
          column: 1,
        },
      ],
      filename,
    },
    // Two twoslash assertions on a single line. Only the first one is used.
    {
      code: dedent`
        let x = 4, y = "four";
        //  ^?     ^? let y: string
      `,
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 1,
          column: 5,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 2,
          column: 7,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 2,
          column: 7,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 1,
          column: 7,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 1,
          column: 7,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'TypesDoNotMatch',
          line: 1,
          column: 5,
        },
      ],
      filename,
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
      options: [],
      errors: [
        {
          messageId: 'OrphanAssertion',
          line: 2,
          column: 1,
        },
      ],
      filename,
    },
    {
      code: dedent`
        const four = 4;  // intentional blank below!

        // ^? const four: number
      `,
      options: [],
      errors: [
        {
          messageId: 'OrphanAssertion',
          line: 3,
          column: 1,
        },
      ],
      filename,
    },
    // Can't have an assertion on the first line of a file.
    {
      code: dedent`
        // ^? const four: number
        const four = 4;
      `,
      options: [],
      errors: [
        {
          messageId: 'OrphanAssertion',
          line: 1,
          column: 1,
        },
      ],
      filename,
    },
  ],
});
