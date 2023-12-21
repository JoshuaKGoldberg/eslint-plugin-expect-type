import { TSESLint } from "@typescript-eslint/utils";

export const messages = {
	DuplicateTSVersionName:
		"Multiple TypeScript versions specified with name '{{ name }}'.",
	ExpectedErrorNotFound: "Expected an error on this line, but found none.",
	FileIsNotIncludedInTSConfig:
		'Expected to find a file "{{ fileName }}" present.',
	FileIsNotIncludedInTSConfigForVersion:
		'Expected to find a file "{{ fileName }}" present for TypeScript version {{ version }}.',
	Multiple$ExpectTypeAssertions:
		"This line has 2 or more $ExpectType assertions.",
	NoTSConfig: `Could not find a tsconfig.json file.`,
	OrphanAssertion: "Can not match a node to this assertion.",
	SyntaxError: "Syntax Error: {{ message }}",
	TypeSnapshotDoNotMatch:
		"Expected type from Snapshot to be: {{ expected }}, got: {{ actual }}",
	TypeSnapshotNotFound:
		"Type Snapshot not found. Please consider running ESLint in FIX mode: eslint --fix",
	TypesDoNotMatch: "Expected type to be: {{ expected }}, got: {{ actual }}",
};

export type MessageIds = keyof typeof messages;

export interface VersionToTest {
	name: string;
	path: string;
}

export interface Options {
	readonly disableExpectTypeSnapshotFix: boolean;
	readonly versionsToTest?: VersionToTest[];
}

export type ExpectRuleContext = TSESLint.RuleContext<MessageIds, [Options]>;

export const defaultOptions: Options = {
	disableExpectTypeSnapshotFix: false,
};
