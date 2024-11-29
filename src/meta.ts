import { TSESLint } from "@typescript-eslint/utils";

export const messages = {
	CouldNotRequireTypeScript:
		"Could not require TypeScript specified with name '{{ name }}' at path '{{ path }}': {{ error }}.",
	DuplicateTSVersionName:
		"Multiple TypeScript versions specified with name '{{ name }}'.",
	ExpectedErrorNotFound: "Expected an error on this line, but found none.",
	ExpectedErrorNotFoundForVersion:
		"Expected an error for TypeScript version {{ version }} on this line, but found none.",
	Multiple$ExpectTypeAssertions:
		"This line has 2 or more $ExpectType assertions.",
	OrphanAssertion: "Can not match a node to this assertion.",
	SyntaxError: "Syntax Error: {{ message }}",
	TypesDoNotMatch: "Expected type to be: {{ expected }}, got: {{ actual }}",
	TypesDoNotMatchForVersion:
		"Expected type for TypeScript version {{ version }} to be: {{ expected }}, got: {{ actual }}",
	TypeSnapshotDoNotMatch:
		"Expected type from snapshot to be: {{ expected }}, got: {{ actual }}",
	TypeSnapshotDoNotMatchForVersion:
		"Expected type for TypeScript version {{ version }} from snapshot to be: {{ expected }}, got: {{ actual }}",
	TypeSnapshotNotFound:
		"Type Snapshot not found. Please consider running ESLint in FIX mode: eslint --fix",
};

export type ExpectRuleContext = TSESLint.RuleContext<MessageIds, [Options]>;

export type MessageIds = keyof typeof messages;

export interface Options {
	readonly disableExpectTypeSnapshotFix: boolean;
	readonly versionsToTest?: VersionToTestOption[];
}

export interface VersionToTestOption {
	name: string;
	path: string;
}
