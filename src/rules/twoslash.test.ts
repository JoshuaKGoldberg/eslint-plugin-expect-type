import dedent from "dedent";

import { expect } from "./expect.js";
import { filename, ruleTester } from "./ruleTester.js";

ruleTester.run("expect", expect, {
	invalid: [
		// Offers a fix for an empty assertion (the usual starting point)
		{
			code: dedent`
        const four = 4;
        //    ^?
        // next line
      `,
			errors: [
				{
					column: 7,
					line: 1,
					messageId: "TypesDoNotMatch",
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
        //    ^?` + " ",
			errors: [
				{
					column: 7,
					line: 1,
					messageId: "TypesDoNotMatch",
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
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "SyntaxError",
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
			errors: [
				{
					column: 5,
					line: 1,
					messageId: "TypesDoNotMatch",
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
			errors: [
				{
					column: 7,
					line: 2,
					messageId: "TypesDoNotMatch",
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
			errors: [
				{
					column: 7,
					line: 2,
					messageId: "TypesDoNotMatch",
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
			errors: [
				{
					column: 7,
					line: 1,
					messageId: "TypesDoNotMatch",
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
			errors: [
				{
					column: 7,
					line: 1,
					messageId: "TypesDoNotMatch",
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
			errors: [
				{
					column: 5,
					line: 1,
					messageId: "TypesDoNotMatch",
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
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "OrphanAssertion",
				},
			],
			filename,
		},
		{
			code: dedent`
        const four = 4;  // intentional blank below!

        // ^? const four: number
      `,
			errors: [
				{
					column: 1,
					line: 3,
					messageId: "OrphanAssertion",
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
			errors: [
				{
					column: 1,
					line: 1,
					messageId: "OrphanAssertion",
				},
			],
			filename,
		},
	],
	valid: [
		// Twoslash
		{
			code: dedent`
        const t = { a: 17, b: 'on' as const };
        //    ^? const t: { a: number; b: "on"; }
      `,
			filename,
		},
		{
			code: dedent`
      let val = 9001;
      //  ^? let val: number
      `,
			filename,
		},
		// Twoslash type from #4
		{
			code: dedent`
        const square = (x: number) => x * x;
        const four = square(2);
        //    ^? const four: number
      `,
			filename,
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
		},
		// Test for a type alias
		{
			code: dedent`
        type MyType = 123;
        //   ^? type MyType = 123
      `,
			filename,
		},
		// Make sure we handle path mappings in package.json
		{
			code: dedent`
        import { FooString } from "./package";
        type Bar = FooString | number;
        //   ^? type Bar = string | number
      `,
			filename,
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
});
