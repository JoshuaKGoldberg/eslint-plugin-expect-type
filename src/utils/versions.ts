import type ts from "typescript";

import { ESLintUtils } from "@typescript-eslint/utils";
import { ReportDescriptor } from "@typescript-eslint/utils/ts-eslint";
import { getTsconfig } from "get-tsconfig";
import * as tsModuleOriginal from "typescript";

import { ExpectRuleContext, MessageIds, VersionToTestOption } from "../meta.js";
import { getProgramForVersion, TSModule } from "./programs.js";

export interface ResolvedVersionToTest {
	program: ts.Program;
	sourceFile: ts.SourceFile;
	tsModule: TSModule;
	version?: string;
}

export type VersionsResolution =
	| VersionsResolutionFailure
	| VersionsResolutionSuccess;

export interface VersionsResolutionFailure {
	error: Pick<ReportDescriptor<MessageIds>, "data" | "messageId">;
}

export interface VersionsResolutionSuccess {
	error?: never;
	versionsToTest: ResolvedVersionToTest[];
}

export function resolveVersionsToTest(
	context: ExpectRuleContext,
	fileName: string,
	versionsToTest: undefined | VersionToTestOption[],
): VersionsResolution {
	const { program: originalProgram } = ESLintUtils.getParserServices(context);

	// ESLintUtils.getParserServices would have thrown if there's no file.
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const originalSourceFile = originalProgram.getSourceFile(fileName)!;

	if (!versionsToTest) {
		return {
			versionsToTest: [
				{
					program: originalProgram,
					sourceFile: originalSourceFile,
					tsModule: tsModuleOriginal,
				},
			],
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const tsconfigPath = getTsconfig(context.filename)!.path;

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

		seenVersionNames.add(version.name);

		const tsModule = tryRequireTypeScript(version);
		if (typeof tsModule === "string") {
			return {
				error: {
					data: { error: tsModule, ...version },
					messageId: "CouldNotRequireTypeScript",
				},
			};
		}

		const program = getProgramForVersion(
			tsconfigPath,
			tsModule,
			version.name,
			originalProgram,
		);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const sourceFile = program.getSourceFile(context.filename)!;

		resolvedVersions.push({
			program,
			sourceFile,
			tsModule,
			version: version.name,
		});
	}

	return {
		versionsToTest: resolvedVersions,
	};
}

function tryRequireTypeScript(version: VersionToTestOption) {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		return require(version.path) as TSModule;
	} catch (error) {
		return (error as Error).message.split("\n")[0];
	}
}
