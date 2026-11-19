import type ts from "typescript";

import { Assertions } from "../assertions/types.ts";
import { getNodeAtPosition, lineOfPosition } from "../utils/locations.ts";
import {
	getLanguageService,
	getNodeForExpectType,
	matchModuloWhitespace,
} from "../utils/typescript.ts";
import { ResolvedVersionToTest } from "../utils/versions.ts";
import { normalizedTypeToString } from "./normalizedTypeToString.ts";
import { ExpectTypeFailures, UnmetExpectation } from "./types.ts";

export function getExpectTypeFailures(
	assertions: Pick<Assertions, "twoSlashAssertions" | "typeAssertions">,
	{ program, sourceFile, tsModule, version }: ResolvedVersionToTest,
): ExpectTypeFailures {
	const checker = program.getTypeChecker();
	const languageService = getLanguageService(program, tsModule);
	const { twoSlashAssertions, typeAssertions } = assertions;
	const unmetExpectations: UnmetExpectation[] = [];

	// Match assertions to the first node that appears on the line they apply to.
	tsModule.forEachChild(sourceFile, function iterate(node) {
		const line = lineOfPosition(node.getStart(sourceFile), sourceFile);
		const assertion = typeAssertions.get(line);
		if (assertion !== undefined) {
			const { expected } = assertion;

			// https://github.com/Microsoft/TypeScript/issues/14077
			if (node.kind === tsModule.SyntaxKind.ExpressionStatement) {
				node = (node as ts.ExpressionStatement).expression;
			}

			const nodeToCheck = getNodeForExpectType(node, tsModule);
			const type = checker.getTypeAtLocation(nodeToCheck);
			const actual = checker.typeToString(
				type,
				/*enclosingDeclaration*/ undefined,
				tsModule.TypeFormatFlags.NoTruncation,
			);

			typeAssertions.delete(line);

			const candidates = expected
				?.split(/\s*\|\|\s*/)
				.map((s) => s.trim())
				.filter(Boolean);

			if (!candidates || !candidateTypeMatches(actual, candidates)) {
				unmetExpectations.push({ actual, assertion, node, version });
			}
		}

		tsModule.forEachChild(node, iterate);
	});

	function candidateTypeMatches(actual: string, candidates: string[]) {
		let actualNormalized: string | undefined;

		for (const candidate of candidates) {
			if (candidate === actual) {
				return true;
			}

			actualNormalized ??= normalizedTypeToString(actual, tsModule);
			const candidateNormalized = normalizedTypeToString(candidate, tsModule);

			if (actualNormalized === candidateNormalized) {
				return true;
			}
		}

		return false;
	}

	const twoSlashFailureLines: number[] = [];
	if (twoSlashAssertions.length) {
		for (const assertion of twoSlashAssertions) {
			const { expected, position } = assertion;
			if (position === -1) {
				// special case for a twoslash assertion on line 1.
				twoSlashFailureLines.push(0);
				continue;
			}

			const node = getNodeAtPosition(sourceFile, position, tsModule);
			if (!node) {
				twoSlashFailureLines.push(
					sourceFile.getLineAndCharacterOfPosition(position).line,
				);
				continue;
			}

			const qi = languageService.getQuickInfoAtPosition(
				sourceFile.fileName,
				node.getStart(),
			);
			if (!qi?.displayParts) {
				twoSlashFailureLines.push(
					sourceFile.getLineAndCharacterOfPosition(position).line,
				);
				continue;
			}

			const actual = qi.displayParts.map((dp) => dp.text).join("");
			if (!matchModuloWhitespace(actual, expected)) {
				unmetExpectations.push({
					actual,
					assertion,
					node,
				});
			}
		}
	}

	return {
		unmetExpectations,
		unusedAssertions: [...twoSlashFailureLines, ...typeAssertions.keys()],
	};
}
