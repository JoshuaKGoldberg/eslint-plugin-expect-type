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
		// ts2.0 doesn't have `isVariableStatement`
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

export function matchReadonlyArray(actual: string, expected: string) {
	if (!(/\breadonly\b/.test(actual) && /\bReadonlyArray\b/.test(expected))) {
		return false;
	}

	const readonlyArrayRegExp = /\bReadonlyArray</y;
	const readonlyModifierRegExp = /\breadonly /y;

	// A<ReadonlyArray<B<ReadonlyArray<C>>>>
	// A<readonly B<readonly C[]>[]>

	let expectedPos = 0;
	let actualPos = 0;
	let depth = 0;
	while (expectedPos < expected.length && actualPos < actual.length) {
		const expectedChar = expected.charAt(expectedPos);
		const actualChar = actual.charAt(actualPos);
		if (expectedChar === actualChar) {
			expectedPos++;
			actualPos++;
			continue;
		}

		// check for end of readonly array
		if (
			depth > 0 &&
			expectedChar === ">" &&
			actualChar === "[" &&
			actualPos < actual.length - 1 &&
			actual.charAt(actualPos + 1) === "]"
		) {
			depth--;
			expectedPos++;
			actualPos += 2;
			continue;
		}

		// check for start of readonly array
		readonlyArrayRegExp.lastIndex = expectedPos;
		readonlyModifierRegExp.lastIndex = actualPos;
		if (
			readonlyArrayRegExp.test(expected) &&
			readonlyModifierRegExp.test(actual)
		) {
			depth++;
			expectedPos += 14; // "ReadonlyArray<".length;
			actualPos += 9; // "readonly ".length;
			continue;
		}

		return false;
	}

	return true;
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
