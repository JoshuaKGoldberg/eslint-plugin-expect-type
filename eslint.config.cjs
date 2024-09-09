const eslint = require("@eslint/js");
const comments = require("@eslint-community/eslint-plugin-eslint-comments/configs");
const vitest = require("@vitest/eslint-plugin");
const eslintPlugin = require("eslint-plugin-eslint-plugin");
const jsdoc = require("eslint-plugin-jsdoc");
const jsonc = require("eslint-plugin-jsonc");
const markdown = require("eslint-plugin-markdown");
const n = require("eslint-plugin-n");
const {
	default: packageJson,
} = require("eslint-plugin-package-json/configs/recommended");
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
			"**/*.snap*",
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
	packageJson,
	perfectionist.configs["recommended-natural"],
	regexp.configs["flat/recommended"],
	...tseslint.config({
		extends: [
			...tseslint.configs.strictTypeChecked,
			...tseslint.configs.stylisticTypeChecked,
		],
		files: ["**/*.js", "**/*.ts"],
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: [".*.js", "*.ts"],
					defaultProject: "./tsconfig.json",
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
			"@typescript-eslint/no-unused-vars": ["error", { caughtErrors: "all" }],

			"@typescript-eslint/prefer-nullish-coalescing": [
				"error",
				{ ignorePrimitives: true },
			],
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{ allowBoolean: true, allowNullish: true, allowNumber: true },
			],

			// These on-by-default rules don't work well for this repo and we like them off.
			"jsdoc/lines-before-block": "off",
			// These off-by-default rules work well for this repo and we like them on.
			"logical-assignment-operators": [
				"error",
				"always",
				{ enforceForIfStatements: true },
			],
			"n/no-unsupported-features/node-builtins": [
				"error",
				{ allowExperimental: true },
			],
			"no-constant-condition": "off",
			// Stylistic concerns that don't interfere with Prettier
			"no-useless-rename": "error",
			"object-shorthand": "error",

			"operator-assignment": "error",
			"perfectionist/sort-objects": [
				"error",
				{
					order: "asc",
					partitionByComment: true,
					type: "natural",
				},
			],
		},
	}),
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

			"n/no-missing-import": [
				"error",
				{ allowModules: ["create-typescript-app"] },
			],
		},
	},
	{
		files: ["**/*.test.*"],
		languageOptions: {
			globals: vitest.environments.env.globals,
		},
		plugins: { vitest },
		rules: {
			...vitest.configs.recommended.rules,

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
