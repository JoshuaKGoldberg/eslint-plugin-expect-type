const comments = require("@eslint-community/eslint-plugin-eslint-comments/configs");
const eslint = require("@eslint/js");
const vitest = require("@vitest/eslint-plugin");
const eslintPlugin = require("eslint-plugin-eslint-plugin");
const jsdoc = require("eslint-plugin-jsdoc");
const jsonc = require("eslint-plugin-jsonc");
const markdown = require("eslint-plugin-markdown");
const n = require("eslint-plugin-n");
const { default: packageJson } = require("eslint-plugin-package-json");
const perfectionist = require("eslint-plugin-perfectionist");
const regexp = require("eslint-plugin-regexp");
const yml = require("eslint-plugin-yml");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
	{
		ignores: [
			"coverage",
			"lib",
			"node_modules",
			"pnpm-lock.yaml",
			"**/*.snap",
			"src/rules/sandbox/**",
		],
	},
	{
		linterOptions: {
			reportUnusedDisableDirectives: "error",
		},
	},
	eslint.configs.recommended,
	...jsonc.configs["flat/recommended-with-json"],
	...markdown.configs.recommended,
	...yml.configs["flat/recommended"],
	...yml.configs["flat/prettier"],
	comments.recommended,
	eslintPlugin.configs["flat/recommended"],
	jsdoc.configs["flat/contents-typescript-error"],
	jsdoc.configs["flat/logical-typescript-error"],
	jsdoc.configs["flat/stylistic-typescript-error"],
	n.configs["flat/recommended"],
	packageJson.configs.recommended,
	perfectionist.configs["recommended-natural"],
	regexp.configs["flat/recommended"],
	{
		extends: [
			...tseslint.configs.strictTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		files: ["**/*.js", "**/*.ts"],
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["*.config.*s", ".*rc.js"],
				},
				tsconfigRootDir: __dirname,
			},
		},
		rules: {
			// These on-by-default rules work well for this repo if configured
			"@typescript-eslint/no-unnecessary-condition": [
				"error",
				{
					allowConstantLoopConditions: true,
				},
			],

			// Stylistic concerns that don't interfere with Prettier
			"logical-assignment-operators": [
				"error",
				"always",
				{ enforceForIfStatements: true },
			],
			"no-useless-rename": "error",
			"object-shorthand": "error",
			"operator-assignment": "error",
		},
		settings: {
			perfectionist: {
				partitionByComment: true,
				type: "natural",
			},
		},
	},
	{
		files: ["**/tsconfig.json"],
		rules: {
			"jsonc/comma-dangle": "off",
			"jsonc/no-comments": "off",
			"jsonc/sort-keys": "error",
		},
	},
	{
		extends: [tseslint.configs.disableTypeChecked],
		files: ["**/*.md/*.ts"],
		rules: {
			// Ignore unused code, as they're often commented with the plugin
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-unused-vars": "off",
		},
	},
	{
		extends: [vitest.configs.recommended],
		files: ["**/*.test.*"],
		rules: {
			// These on-by-default rules aren't useful in test files.
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-call": "off",
		},
	},
	{
		files: ["**/*.{yml,yaml}"],
		rules: {
			"yml/file-extension": ["error", { extension: "yml" }],
			"yml/sort-keys": [
				"error",
				{
					order: { type: "asc" },
					pathPattern: "^.*$",
				},
			],
			"yml/sort-sequence-values": [
				"error",
				{
					order: { type: "asc" },
					pathPattern: "^.*$",
				},
			],
		},
	},
);
