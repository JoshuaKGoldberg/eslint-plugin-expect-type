import dedent from "dedent";

import { expect } from "./expect.js";
import { filename, ruleTester } from "./ruleTester.js";

ruleTester.run("expect", expect, {
	invalid: [
		{
			code: dedent`
      // $ExpectType number
      const t = 'a';
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypesDoNotMatch",
				},
			],
			filename,
		},
		{
			code: dedent`
      //$ExpectType number
      const t = 'a';
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypesDoNotMatch",
				},
			],
			filename,
		},
		// Complex type - historically (https://github.com/microsoft/TypeScript/issues/9879), dtslint and eslint type comparison fails here
		{
			code: dedent`
      // $ExpectType { a: number; b: "on"; }
      const t = { b: 'on' as const, a: 17 };
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypesDoNotMatch",
				},
			],
			filename,
		},
		{
			code: dedent`
      // $ExpectType number || string;
      const t = false;
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypesDoNotMatch",
				},
			],
			filename,
		},
	],
	valid: [
		// Primitive type
		{
			code: dedent`
      // $ExpectType number
      const t = 6 as number;
    `,
			filename,
		},
		// Complex type
		{
			code: dedent`
      // $ExpectType { a: number; b: "on"; }
      const t = { a: 17, b: 'on' as const };
    `,
			filename,
		},
		// Ignored TypeScript compiler complaints
		{
			code: dedent`
      function hasUnusedParam(unusedParam: number, implicitAnyParam) {
        const unusedLocal = 0;
        return implicitAnyParam;
      }
    `,
			filename,
		},
		{
			code: dedent`
      // $ExpectType number || string
      const t = 6 as number;
      `,
			filename,
		},
		{
			code: dedent`
      // $ExpectType string || number
      const t = 6 as number;
      `,
			filename,
		},
	],
});
