import dedent from "dedent";

import { expect } from "./expect.js";
import { filename, ruleTester } from "./ruleTester.js";

ruleTester.run("expect", expect, {
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
			name: "Snapshot has different type",
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
		{
			code: dedent`
      // $ExpectTypeSnapshot TypeSnapshotDoNotMatchOr
      const configB = { d: 0 };
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypeSnapshotDoNotMatch",
				},
			],
			filename,
			name: "Snapshot has different type than ||",
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
	],
	valid: [
		{
			code: dedent`
      // $ExpectTypeSnapshot SnapshotMatches
      const c = { a: 15, b: "b" as const, c: "c" };
    `,
			filename,
			name: "Snapshot matches",
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
		{
			code: dedent`
      // $ExpectTypeSnapshot SnapshotMatchesOr
      const c = { a: 15, b: "b" as const, c: "c" };
    `,
			filename,
			name: "Snapshot matches first || constituent",
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
		{
			code: dedent`
      // $ExpectTypeSnapshot SnapshotMatchesOr
      const c = { d: true };
    `,
			filename,
			name: "Snapshot matches second || constituent",
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
	],
});
