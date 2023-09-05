import dedent from "dedent";

import { filename, runRuleTests } from "../helpers/configs.js";

runRuleTests({
	invalid: [
		// Snapshot name is not specified
		{
			code: dedent`
      // $ExpectTypeSnapshot
      const Button = class {};
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "SyntaxError",
				},
			],
			filename,
			options: [],
		},
		{
			code: dedent`
      //$ExpectTypeSnapshot
      const Button = class {};
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "SyntaxError",
				},
			],
			filename,
			options: [],
		},
		// Snapshot not found. Suggestion to run eslint --fix to create snapshot.
		{
			code: dedent`
      // $ExpectTypeSnapshot snapshot-not-found
      const configA = { a: 15, b: "b" as const, c: "c" };
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypeSnapshotNotFound",
				},
			],
			filename,
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
		// Snapshot has different type.
		{
			code: dedent`
      // $ExpectTypeSnapshot TypeSnapshotDoNotMatch
      const configB = { a: 15, b: "b" as const, c: "c" };
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypeSnapshotDoNotMatch",
				},
			],
			filename,
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
	],
	valid: [
		// Snapshot matches.
		{
			code: dedent`
      // $ExpectTypeSnapshot SnapshotMatches
      const c = { a: 15, b: "b" as const, c: "c" };
    `,
			filename,
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
	],
});
