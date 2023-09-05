/**
 * @file Tests for $ExpectError.
 */
import dedent from "dedent";

import { filename, runRuleTests } from "../helpers/configs.js";

runRuleTests({
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
			options: [],
		},
	],
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
});
