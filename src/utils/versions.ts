import type ts from "typescript";

import { ESLintUtils } from "@typescript-eslint/utils";
import { ReportDescriptor } from "@typescript-eslint/utils/ts-eslint";
import fs from "node:fs";
import path from "node:path";
import * as tsModuleOriginal from "typescript";

import { ExpectRuleContext, MessageIds, VersionToTestOption } from "../meta.js";
import { findUp } from "./files.js";
import { getProgramForVersion, TSModule } from "./programs.js";

export interface ResolvedVersionToTest {
	program: ts.Program;
	sourceFile: ts.SourceFile;
	tsModule: TSModule;
}

export type VersionsResolution =
	| VersionsResolutionFailure
	| VersionsResolutionSuccess;

export interface VersionsResolutionFailure {
	error: Pick<ReportDescriptor<MessageIds>, "data" | "messageId">;
}

export interface VersionsResolutionSuccess {
	error?: never;
	versions: ResolvedVersionToTest[];
}

export function resolveVersionsToTest(
	context: ExpectRuleContext,
	versionsToTest: undefined | VersionToTestOption[],
): VersionsResolution {
	const { program: originalProgram } = ESLintUtils.getParserServices(context);
	const originalSourceFile = originalProgram.getSourceFile(context.filename);

	if (!originalSourceFile) {
		return {
			error: {
				data: { filename: context.filename },
				messageId: "FileIsNotIncludedInTSConfig",
			},
		};
	}

	if (!versionsToTest) {
		return {
			versions: [
				{
					program: originalProgram,
					sourceFile: originalSourceFile,
					tsModule: tsModuleOriginal,
				},
			],
		};
	}

	const tsconfigPath = findUp(context.filename, (dir) => {
		const tsconfig = path.join(dir, "tsconfig.json");
		return fs.existsSync(tsconfig) ? tsconfig : undefined;
	});

	if (!tsconfigPath) {
		return {
			error: { messageId: "NoTSConfig" },
		};
	}

	const resolvedVersions: ResolvedVersionToTest[] = [];
	const seenVersionNames = new Set<string>();

	for (const version of versionsToTest) {
		if (seenVersionNames.has(version.name)) {
			return {
				error: {
					data: { name: version.name },
					messageId: "DuplicateTSVersionName",
				},
			};
		}

		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const tsModule = require(version.path) as TSModule;
		const program = getProgramForVersion(
			tsconfigPath,
			tsModule,
			version.name,
			originalProgram,
		);

		const sourceFile = program.getSourceFile(context.filename);

		if (!sourceFile) {
			return {
				error: {
					data: { filename: context.filename, version: version.name },
					messageId: "FileIsNotIncludedInTSConfigForVersion",
				},
			};
		}

		resolvedVersions.push({ program, sourceFile, tsModule });
	}

	return {
		versions: resolvedVersions,
	};
}
