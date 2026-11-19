import dedent from "dedent";

import { expect } from "./expect.ts";
import { filename, ruleTester } from "./ruleTester.ts";

ruleTester.run("expect", expect, {
	invalid: [
		{
			code: dedent`
      // $ExpectError
      const t: number = 5;
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "ExpectedErrorNotFound",
				},
			],
			filename,
		},
	],
	valid: [
		{
			code: dedent`
      // $ExpectError
      const t: number = 'a';
    `,
			filename,
		},
	],
});
