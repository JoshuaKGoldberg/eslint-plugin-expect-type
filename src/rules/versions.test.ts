import path from "node:path";

import { expect } from "./expect.js";
import { ruleTester, tsconfigRootDir } from "./ruleTester.js";

const filename = path.join(tsconfigRootDir, "versioned.ts");

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
			filename,
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
			filename,
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
			filename,
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
	],
	valid: [],
});
