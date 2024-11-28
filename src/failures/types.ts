import type ts from "typescript";

import { Assertion } from "../assertions/types.js";

export interface ExpectTypeFailures {
	/**
	 * Lines with an $ExpectType, but a different type was there.
	 */
	readonly unmetExpectations: readonly UnmetExpectation[];

	/**
	 * Lines with an $ExpectType, but no node could be found.
	 */
	readonly unusedAssertions: Iterable<number>;
}

export interface UnmetExpectation {
	actual: string;
	assertion: Assertion;
	node: ts.Node;
}
