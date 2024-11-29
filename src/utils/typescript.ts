import type ts from "typescript";

import { TSModule } from "./programs.js";

export function getLanguageServiceHost(
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
