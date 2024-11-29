import dedent from "dedent";
import assert from "node:assert";

import { getTypeSnapshot, updateTypeSnapshot } from "../utils/snapshot.js";
import { expect } from "./expect.js";
import { filename, ruleTester } from "./ruleTester.js";

function createResetHooks(
	snapshotName: string,
	after: string,
	before: null | string,
) {
	return {
		after() {
			process.argv.pop();

			const existing = getTypeSnapshot(
				"src/rules/sandbox/file.ts",
				snapshotName,
			);

			assert.equal(existing, after);

			updateTypeSnapshot("src/rules/sandbox/file.ts", snapshotName, after);
		},
		before() {
			process.argv.push("--fix");
			updateTypeSnapshot("src/rules/sandbox/file.ts", snapshotName, before);
		},
	};
}

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
			name: "Snapshot not found. Suggestion to run eslint --fix to create snapshot.",
			options: [{ disableExpectTypeSnapshotFix: true }],
		},
		{
			...createResetHooks("SnapshotNotFoundFixing", "boolean[]", ""),
			code: dedent`
      // $ExpectTypeSnapshot SnapshotNotFoundFixing
      const configA = [false, true];
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypeSnapshotDoNotMatch",
				},
			],
			filename,
			name: "Snapshot does not match with --fix.",
		},
		{
			...createResetHooks("SnapshotNotMatchedFixing", "boolean[]", null),
			code: dedent`
      // $ExpectTypeSnapshot SnapshotNotMatchedFixing
      const configA = [false, true];
    `,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypeSnapshotDoNotMatch",
				},
			],
			filename,
			name: "Snapshot not found with --fix.",
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
