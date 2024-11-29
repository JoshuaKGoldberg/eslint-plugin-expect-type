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
		{
			code: dedent`
      // $ExpectType number
      const t = 6 as number;
    `,
			filename,
			name: "Primitive type",
		},
		{
			code: dedent`
      // $ExpectType number
      const t = 6 as (number);
    `,
			filename,
			name: "Parenthesized primitive type",
		},
		{
			code: dedent`
      // $ExpectType number | string
      const t = 6 as number | string;
    `,
			filename,
			name: "Union of primitive types, in order",
		},
		{
			code: dedent`
      // $ExpectType string | number
      const t = 6 as number | string;
    `,
			filename,
			name: "Union of primitive types, out of order",
		},
		{
			code: dedent`
      // $ExpectType string[]
      const t = [] as string[]
    `,
			filename,
			name: "readonly array",
		},
		{
			code: dedent`
      // $ExpectType readonly string[]
      const t = [] as readonly string[]
    `,
			filename,
			name: "readonly array",
		},
		{
			code: dedent`
      // $ExpectType readonly string[]
      const t = [] as ReadonlyArray<string>
    `,
			filename,
			name: "readonly array and ReadonlyArray",
		},
		{
			code: dedent`
      // $ExpectType ReadonlyArray<string>
      const t = [] as readonly string[]
    `,
			filename,
			name: "ReadonlyArray and readonly array",
		},
		{
			code: dedent`
      // $ExpectType ReadonlyArray<string>
      const t = [] as ReadonlyArray<string>
    `,
			filename,
			name: "ReadonlyArray",
		},
		{
			code: dedent`
      // $ExpectType { a: number; b: "on"; }
      const t = { a: 17, b: 'on' as const };
    `,
			filename,
			name: "Complex type",
		},
		{
			code: dedent`
      function hasUnusedParam(unusedParam: number, implicitAnyParam) {
        const unusedLocal = 0;
        return implicitAnyParam;
      }
    `,
			filename,
			name: "Ignored TypeScript compiler complaints",
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
      // $ExpectType number || string | number
      const t = 6 as number;
      `,
			filename,
		},
		{
			code: dedent`
      // $ExpectType string | number || number
      const t = 6 as number;
      `,
			filename,
		},
	],
});
