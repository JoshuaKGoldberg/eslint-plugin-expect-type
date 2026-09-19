import type * as ts from "typescript";

import { CachedFactory, WeakCachedFactory } from "cached-factory";
import fs from "node:fs";
import path from "node:path";
import v8 from "node:v8";

export type TSModule = typeof ts;

type ProgramsByModule = WeakCachedFactory<
	TSModule,
	CachedFactory<string, ts.Program>
>;

interface ReadConfigFile {
	config: {
		compilerOptions: {
			module: string;
		};
	};
}

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
 * Maps a ts.Program to its equivalent created with a specific TypeScript module.
 */
export function getProgramForVersion(
	configFile: string,
	ts: TSModule,
	originalProgram: ts.Program,
): ts.Program {
	const program = programCache.get(originalProgram).get(ts).get(configFile);

	const heapStats = v8.getHeapStatistics();
	const heapUsage = heapStats.used_heap_size / heapStats.heap_size_limit;
	if (heapUsage > 0.9) {
		programCache.clear();
	}

	return program;
}

const programCache = new WeakCachedFactory<ts.Program, ProgramsByModule>(
	() =>
		new WeakCachedFactory(
			(ts: TSModule) =>
				new CachedFactory((configFile: string) =>
					createProgram(configFile, ts),
				),
		),
);
