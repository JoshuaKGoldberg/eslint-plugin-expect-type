export type Assertion = ManualAssertion | SnapshotAssertion | TwoSlashAssertion;

export interface Assertions {
	/**
	 * Lines with more than one assertion (these are errors).
	 */
	readonly duplicates: readonly number[];

	/**
	 * Lines with an $ExpectError.
	 */
	readonly errorLines: ReadonlySet<number>;

	/**
	 * Syntax Errors
	 */
	readonly syntaxErrors: readonly SyntaxError[];

	/**
	 * Twoslash-style type assertions in the file
	 */
	readonly twoSlashAssertions: readonly TwoSlashAssertion[];

	/**
	 * Map from a line number to the expected type at that line.
	 */
	readonly typeAssertions: Map<number, Assertion>;
}

export interface ManualAssertion {
	readonly assertionType: "manual";
	readonly expected: string;
}

export interface SnapshotAssertion {
	readonly assertionType: "snapshot";
	readonly expected: string | undefined;
	readonly snapshotName: string;
}

export interface SyntaxError {
	readonly line: number;
	readonly type:
		| "InvalidTwoslash"
		| "MissingExpectType"
		| "MissingSnapshotName";
}

export interface TwoSlashAssertion {
	readonly assertionType: "twoslash";

	/**
	 * The expected type in the twoslash comment
	 */
	readonly expected: string;

	/**
	 * Text before the "^?" (used to produce continuation lines for fixer)
	 */
	readonly expectedPrefix: string;

	/**
	 * Range of positions corresponding to the "expected" string (for fixer)
	 */
	readonly expectedRange: [number, number];

	/**
	 * Does a space need to be added after "^?" when fixing? (If "^?" ends the line.)
	 */
	readonly insertSpace: boolean;

	/**
	 * Position in the source file that the twoslash assertion points at
	 */
	readonly position: number;
}
