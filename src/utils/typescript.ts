import type ts from "typescript";

import { WeakCachedFactory } from "cached-factory";

import { TSModule } from "./programs.js";

function getLanguageServiceHost(
	program: ts.Program,
	tsModule: TSModule,
): ts.LanguageServiceHost {
	return {
		getCompilationSettings: () => program.getCompilerOptions(),
		getCurrentDirectory: () => program.getCurrentDirectory(),
		getDefaultLibFileName: (options) => tsModule.getDefaultLibFilePath(options),
		getScriptFileNames: () =>
			program.getSourceFiles().map((sourceFile) => sourceFile.fileName),
		getScriptSnapshot: (name) =>
			tsModule.ScriptSnapshot.fromString(
				program.getSourceFile(name)?.text ?? "",
			),
		getScriptVersion: () => "1",
		// NB: We can't check `program` for files, it won't contain valid files like package.json
		/* eslint-disable @typescript-eslint/unbound-method */
		directoryExists: tsModule.sys.directoryExists,
		fileExists: tsModule.sys.fileExists,
		getDirectories: tsModule.sys.getDirectories,
		readDirectory: tsModule.sys.readDirectory,
		readFile: tsModule.sys.readFile,
		/* eslint-enable @typescript-eslint/unbound-method */
	};
}

/**
 * Gets a language service for the program, creating one if it doesn't exist yet.
 * The service is cached per program so that linting many files against the same
 * program only pays for creating the service once.
 */
export function getLanguageService(
	program: ts.Program,
	tsModule: TSModule,
): ts.LanguageService {
	return languageServices.get(tsModule).get(program);
}

const languageServices = new WeakCachedFactory(
	(tsModule: TSModule) =>
		new WeakCachedFactory((program: ts.Program) =>
			tsModule.createLanguageService(
				getLanguageServiceHost(program, tsModule),
				getDocumentRegistry(program, tsModule),
			),
		),
);

export function getNodeForExpectType(
	node: ts.Node,
	tsModule: TSModule,
): ts.Node {
	if (tsModule.isVariableStatement(node)) {
		const {
			declarationList: { declarations },
		} = node;
		if (declarations.length === 1) {
			const { initializer } = declarations[0];
			if (initializer) {
				return initializer;
			}
		}
	}

	return node;
}

export function matchModuloWhitespace(
	actual: string,
	expected: string,
): boolean {
	// TODO: it's much easier to normalize actual based on the displayParts
	//       This isn't 100% correct if a type has a space in it, e.g. type T = "string literal"
	const normActual = actual.replace(/[\n\r ]+/g, " ").trim();
	const normExpected = expected.replace(/[\n\r ]+/g, " ").trim();
	return normActual === normExpected;
}

/**
 * Creates a document registry that hands the language service the program's
 * existing source files. Without this, the language service would re-parse and
 * re-bind every file in the program (including lib.*.d.ts files) from scratch.
 */
function getDocumentRegistry(
	program: ts.Program,
	tsModule: TSModule,
): ts.DocumentRegistry {
	const fallback = tsModule.createDocumentRegistry();

	return {
		...fallback,
		acquireDocumentWithKey: (fileName, path, ...args) =>
			program.getSourceFileByPath(path) ??
			fallback.acquireDocumentWithKey(fileName, path, ...args),
		releaseDocumentWithKey: (
			path: ts.Path,
			key: ts.DocumentRegistryBucketKey,
			scriptKind?: ts.ScriptKind,
			impliedNodeFormat?: ts.ResolutionMode,
		) => {
			// Files served from the program were never acquired from the fallback.
			if (!program.getSourceFileByPath(path)) {
				fallback.releaseDocumentWithKey(
					path,
					key,
					scriptKind ?? tsModule.ScriptKind.Unknown,
					impliedNodeFormat,
				);
			}
		},
		updateDocumentWithKey: (fileName, path, ...args) =>
			program.getSourceFileByPath(path) ??
			fallback.updateDocumentWithKey(fileName, path, ...args),
	};
}
