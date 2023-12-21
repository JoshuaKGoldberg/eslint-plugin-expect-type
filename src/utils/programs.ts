import type * as ts from "typescript";

import fs from "node:fs";
import path from "node:path";

type TSModule = typeof ts;

interface ReadConfigFile {
	config: {
		compilerOptions: {
			module: string;
		};
	};
}

function createProgram(configFile: string, ts: TSModule): ts.Program {
	console.log("createProgram", { configFile }, ts.version);
	const projectDirectory = path.dirname(configFile);
	const { config } = ts.readConfigFile(configFile, (...args) => {
		console.log("readConfigFile reader", { args });
		return ts.sys.readFile(...args);
	}) as ReadConfigFile;
	const parseConfigHost: ts.ParseConfigHost = {
		fileExists: fs.existsSync,
		readDirectory: (dir) => {
			console.log("parseConfigHost readDirectory", { dir });
			return ts.sys.readDirectory(dir);
		},
		readFile: (file) => {
			console.log("parseConfigHost readFile", { file });
			return fs.readFileSync(file, "utf8");
		},
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
	console.log({ parsed });

	// If the TypeScript version is too old to handle the "node16" module option,
	// we can still run tests falling back to commonjs/node.
	// Once 4.7 is out of DefinitelyTyped support (2024-05) we can remove this.
	// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html
	if (
		config.compilerOptions.module.toLowerCase() === "node16" &&
		parsed.options.module === undefined
	) {
		parsed.options.module = ts.ModuleKind.CommonJS;
		// eslint-disable-next-line deprecation/deprecation
		parsed.options.moduleResolution = ts.ModuleResolutionKind.NodeJs;
	}

	const host = ts.createCompilerHost(parsed.options, true);
	return ts.createProgram(parsed.fileNames, parsed.options, host);
}

const programCache = new WeakMap<ts.Program, Map<string, ts.Program>>();

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
