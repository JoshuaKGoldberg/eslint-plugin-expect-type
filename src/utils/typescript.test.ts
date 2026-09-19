import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

import { getLanguageService } from "./typescript.js";

const fileName = path.join(
	__dirname,
	"../rules/sandbox/versioned-no-errors.ts",
);

function createProgram() {
	return ts.createProgram({
		options: { strict: true },
		rootNames: [fileName],
	});
}

describe("getLanguageService", () => {
	it("returns quick info from the program's source files", () => {
		const program = createProgram();
		const sourceFile = program.getSourceFile(fileName);

		const languageService = getLanguageService(program, ts);
		const quickInfo = languageService.getQuickInfoAtPosition(
			fileName,
			sourceFile?.text.indexOf("value") ?? -1,
		);

		expect(quickInfo?.displayParts?.map((part) => part.text).join("")).toBe(
			"const value: string",
		);
		expect(languageService.getProgram()?.getSourceFile(fileName)).toBe(
			sourceFile,
		);
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
});
