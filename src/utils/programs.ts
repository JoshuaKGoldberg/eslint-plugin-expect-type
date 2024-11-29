import type * as ts from "typescript";

import fs from "node:fs";
import path from "node:path";

export type TSModule = typeof ts;

interface ReadConfigFile {
	config: {
		compilerOptions: {
			module: string;
		};
	};
}

const programCache = new WeakMap<ts.Program, Map<string, ts.Program>>();

function createProgram(configFile: string, ts: TSModule): ts.Program {
	const projectDirectory = path.dirname(configFile);
	const { config } = ts.readConfigFile(configFile, (...args) => {
		return ts.sys.readFile(...args);
	}) as ReadConfigFile;
	const parseConfigHost: ts.ParseConfigHost = {
		fileExists: fs.existsSync,
		// eslint-disable-next-line @typescript-eslint/unbound-method
		readDirectory: ts.sys.readDirectory,
		readFile: (file) => fs.readFileSync(file, "utf8"),
		useCaseSensitiveFileNames: true,
	};
	const parsed = ts.parseJsonConfigFileContent(
		config,
		parseConfigHost,
		path.resolve(projectDirectory),
		{
			noEmit: true,
		},
	);

	const host = ts.createCompilerHost(parsed.options, true);
	return ts.createProgram(parsed.fileNames, parsed.options, host);
}

/**
 * Maps a ts.Program to its equivalent created with a specific version.
 */
export function getProgramForVersion(
	configFile: string,
	ts: TSModule,
	versionName: string,
	lintProgram: ts.Program,
): ts.Program {
	let versionToProgram = programCache.get(lintProgram);
	if (versionToProgram === undefined) {
		versionToProgram = new Map<string, ts.Program>();
		programCache.set(lintProgram, versionToProgram);
	}

	let newProgram = versionToProgram.get(versionName);
	if (newProgram === undefined) {
		newProgram = createProgram(configFile, ts);
		versionToProgram.set(versionName, newProgram);
	}

	return newProgram;
}