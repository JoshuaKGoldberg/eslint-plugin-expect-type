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
	versionsToTest: VersionToTest[] | undefined,
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
			versions: [{ program: originalProgram, sourceFile: originalSourceFile }],
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

		const program = getProgramForVersion(
			tsconfigPath,
			ts,
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

		resolvedVersions.push({ program, sourceFile });
	}

	return {
		versions: resolvedVersions,
	};
}
