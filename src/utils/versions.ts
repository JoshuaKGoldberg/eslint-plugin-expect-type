import { ESLintUtils } from "@typescript-eslint/utils";
import { ReportDescriptor } from "@typescript-eslint/utils/ts-eslint";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

import { ExpectRuleContext, MessageIds, VersionToTest } from "../meta.js";
import { findUp } from "../utils/files.js";
import { getProgramForVersion } from "./programs.js";

export interface VersionsResolutionFailure {
	error: Pick<ReportDescriptor<MessageIds>, "data" | "messageId">;
}

export interface ResolvedVersionToTest {
	program: ts.Program;
	sourceFile: ts.SourceFile;
}

export interface VersionsResolutionSuccess {
	error?: never;
	versions: ResolvedVersionToTest[];
}

export type VersionsResolution =
	| VersionsResolutionFailure
	| VersionsResolutionSuccess;

export function resolveVersionsToTest(
	context: ExpectRuleContext,
	versionsToTest: VersionToTest[],
): VersionsResolution {
	const tsconfigPath = findUp(context.filename, (dir) => {
		const tsconfig = path.join(dir, "tsconfig.json");
		return fs.existsSync(tsconfig) ? tsconfig : undefined;
	});

	if (!tsconfigPath) {
		return {
			error: { messageId: "NoTSConfig" },
		};
	}

	const parserServices = ESLintUtils.getParserServices(context);

	if (!parserServices.program.getSourceFile(context.filename)) {
		return {
			error: {
				data: { filename: context.filename },
				messageId: "FileIsNotIncludedInTSConfig",
			},
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

		const program = getProgramForVersion(
			tsconfigPath,
			ts,
			version.name,
			parserServices.program,
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

		resolvedVersions.push({ program, sourceFile });
	}

	return {
		versions: resolvedVersions,
	};
}
