import path from "node:path";

import { expect } from "./expect.js";
import { ruleTester, tsconfigRootDir } from "./ruleTester.js";

ruleTester.run("expect", expect, {
	invalid: [
		{
			code: `// ^? CouldNotRequireTypeScript`,
			errors: [
				{
					data: {
						error: "Cannot find module 'typescript-invalid'",
						name: "invalid",
						path: "typescript-invalid",
					},
					messageId: "CouldNotRequireTypeScript",
				},
			],
			filename: path.join(tsconfigRootDir, "versioned-errors.ts"),
			options: [
				{
					disableExpectTypeSnapshotFix: true,
					versionsToTest: [
						{
							name: "invalid",
							path: "typescript-invalid",
						},
					],
				},
			],
		},
		{
			code: `// ^? DuplicateTSVersionName`,
			errors: [
				{
					data: { name: "current" },
					messageId: "DuplicateTSVersionName",
				},
			],
			filename: path.join(tsconfigRootDir, "versioned-errors.ts"),
			options: [
				{
					disableExpectTypeSnapshotFix: true,
					versionsToTest: [
						{
							name: "current",
							path: "typescript",
						},
						{
							name: "current",
							path: "typescript",
						},
					],
				},
			],
		},
		{
			code: `// ^? TypesDoNotMatchForVersion`,
			errors: [
				{
					data: {
						actual: "string | undefined",
						expected: "string",
						version: "5.4",
					},
					line: 7,
					messageId: "TypesDoNotMatchForVersion",
				},
				{
					data: {
						actual: "string",
						expected: "string | undefined",
						version: "current",
					},
					line: 11,
					messageId: "TypesDoNotMatchForVersion",
				},
			],
			filename: path.join(tsconfigRootDir, "versioned-errors.ts"),
			options: [
				{
					disableExpectTypeSnapshotFix: true,
					versionsToTest: [
						{
							name: "current",
							path: "typescript",
						},
						{
							name: "5.4",
							path: "typescript54",
						},
					],
				},
			],
		},
		{
			code: `// ^? ExpectedErrorNotFoundForVersion`,
			errors: [
				{
					data: {
						version: "current",
					},
					line: 4,
					messageId: "ExpectedErrorNotFoundForVersion",
				},
			],
			filename: path.join(tsconfigRootDir, "versioned-no-errors.ts"),
			options: [
				{
					disableExpectTypeSnapshotFix: true,
					versionsToTest: [
						{
							name: "current",
							path: "typescript",
						},
					],
				},
			],
		},
		{
			code: `// ^? TypeSnapshotDoNotMatchForVersion`,
			errors: [
				{
					column: 1,
					line: 2,
					messageId: "TypeSnapshotDoNotMatch",
				},
			],
			filename: path.join(tsconfigRootDir, "versioned-snapshot.ts"),
			name: "Snapshot has different type",
			options: [
				{
					disableExpectTypeSnapshotFix: true,
					versionsToTest: [
						{
							name: "current",
							path: "typescript",
						},
					],
				},
			],
		},
	],
	valid: [],
});
