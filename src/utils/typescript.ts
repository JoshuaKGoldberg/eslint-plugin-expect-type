import * as ts from "typescript";

export function getLanguageServiceHost(
	program: ts.Program,
): ts.LanguageServiceHost {
	return {
		getCompilationSettings: () => program.getCompilerOptions(),
		getCurrentDirectory: () => program.getCurrentDirectory(),
		getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
		getScriptFileNames: () =>
			program.getSourceFiles().map((sourceFile) => sourceFile.fileName),
		getScriptSnapshot: (name) =>
			ts.ScriptSnapshot.fromString(program.getSourceFile(name)?.text ?? ""),
		getScriptVersion: () => "1",
		// NB: We can't check `program` for files, it won't contain valid files like package.json
		/* eslint-disable @typescript-eslint/unbound-method */
		directoryExists: ts.sys.directoryExists,
		fileExists: ts.sys.fileExists,
		getDirectories: ts.sys.getDirectories,
		readDirectory: ts.sys.readDirectory,
		readFile: ts.sys.readFile,
		/* eslint-enable @typescript-eslint/unbound-method */
	};
}

export function getNodeForExpectType(node: ts.Node): ts.Node {
	if (ts.isVariableStatement(node)) {
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
