import ts from "typescript";
import { describe, expect, it } from "vitest";

import { getLanguageService } from "./typescript.js";

const fileName = "/Example/File.ts";
const text = "declare const value: string;";

function createProgram(useCaseSensitiveFileNames = true) {
	const options: ts.CompilerOptions = { lib: ["lib.es5.d.ts"], types: [] };
	const host = ts.createCompilerHost(options);

	return ts.createProgram({
		host: {
			...host,
			getCanonicalFileName: (file) =>
				useCaseSensitiveFileNames ? file : file.toLowerCase(),
			getSourceFile: (file, ...args) =>
				file === fileName
					? ts.createSourceFile(file, text, ts.ScriptTarget.ES5)
					: host.getSourceFile(file, ...args),
			useCaseSensitiveFileNames: () => useCaseSensitiveFileNames,
		},
		options,
		rootNames: [fileName],
	});
}

describe("getLanguageService", () => {
	it.each([true, false])(
		"reuses the program's source files when useCaseSensitiveFileNames is %s",
		(useCaseSensitiveFileNames) => {
			const program = createProgram(useCaseSensitiveFileNames);

			const languageService = getLanguageService(program, ts);
			const quickInfo = languageService.getQuickInfoAtPosition(
				fileName,
				text.indexOf("value"),
			);

			expect(quickInfo?.displayParts?.map((part) => part.text).join("")).toBe(
				"const value: string",
			);
			expect(languageService.getProgram()?.getSourceFile(fileName)).toBe(
				program.getSourceFile(fileName),
			);
		},
	);

	it("keeps the same language service program across requests", () => {
		const languageService = getLanguageService(createProgram(), ts);

		expect(languageService.getProgram()).toBe(languageService.getProgram());
	});

	it("reuses the language service for the same program", () => {
		const program = createProgram();

		const languageServiceA = getLanguageService(program, ts);
		const languageServiceB = getLanguageService(program, ts);

		expect(languageServiceA).toBe(languageServiceB);
	});

	it("creates a new language service for a different program", () => {
		const languageServiceA = getLanguageService(createProgram(), ts);
		const languageServiceB = getLanguageService(createProgram(), ts);

		expect(languageServiceA).not.toBe(languageServiceB);
	});

	it("can be disposed", () => {
		const languageService = getLanguageService(createProgram(), ts);
		languageService.getProgram();

		expect(() => {
			languageService.dispose();
		}).not.toThrow();
	});
});
