// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockDevelopmentDocs,
	blockESLint,
	blockExports,
	blockGitHubActionsCI,
	blockMITLicense,
	blockPackageJson,
	blockPrettier,
	blockTSDown,
	blockTypeScript,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		extensions: [
			blockDevelopmentDocs({
				sections: {
					Building: {
						innerSections: [
							{
								contents: `
Run [\`eslint-doc-generator\`](https://github.com/bmish/eslint-doc-generator) to generate Markdown files documenting rules.

\`\`\`shell
pnpm build:docs
\`\`\`
`,
								heading: "Building Docs",
							},
						],
					},
					Linting: {
						contents: {
							items: [
								"- `pnpm lint:docs` ([eslint-doc-generator](https://github.com/bmish/eslint-doc-generator)): Generates and validates documentation for ESLint rules",
								"- `pnpm lint:packages` ([pnpm dedupe --check](https://pnpm.io/cli/dedupe)): Checks for unnecessarily duplicated packages in the `pnpm-lock.yaml` file",
							],
						},
					},
				},
			}),
			blockESLint({
				extensions: [
					{
						extends: ["eslintPlugin.configs.recommended"],
						files: ["**/*.ts"],
						rules: {
							"@typescript-eslint/no-unnecessary-condition": [
								"error",
								{ allowConstantLoopConditions: "only-allowed-literals" },
							],
						},
					},
					{
						extends: ["tseslint.configs.disableTypeChecked"],
						files: ["**/*.md/*.ts"],
						rules: [
							{
								comment:
									"Ignore unused code, as they're often commented with the plugin",
								entries: {
									"@typescript-eslint/no-unused-expressions": "off",
									"@typescript-eslint/no-unused-vars": "off",
								},
							},
						],
					},
					{
						files: ["package.json"],
						rules: [
							{
								comment:
									"@typescript-eslint/parser is provided transitively by typescript-eslint, and CTA removes it from devDependencies",
								entries: {
									"package-json/specify-peers-locally": "off",
								},
							},
						],
					},
				],
				ignores: ["CHANGELOG.md", "src/rules/sandbox/**"],
				imports: [
					{
						source: {
							packageName: "eslint-plugin-eslint-plugin",
							version: "7.6.2",
						},
						specifier: "eslintPlugin",
					},
				],
			}),
			blockGitHubActionsCI({
				jobs: [
					{
						name: "Lint Docs",
						steps: [{ run: "pnpm build" }, { run: "pnpm lint:docs" }],
					},
				],
			}),
			blockPackageJson({
				properties: {
					exports: {
						".": {
							import: {
								types: "./dist/index.d.mts",
								default: "./dist/index.mjs",
							},
							require: {
								types: "./dist/index.d.cts",
								default: "./dist/index.cjs",
							},
						},
						"./configs/recommended": {
							import: {
								types: "./dist/configs/recommended.d.mts",
								default: "./dist/configs/recommended.mjs",
							},
							require: {
								types: "./dist/configs/recommended.d.cts",
								default: "./dist/configs/recommended.cjs",
							},
						},
					},
					main: "./dist/index.cjs",
					type: "module",
				},
			}),
			blockPrettier({
				ignores: ["/LICENSE.md"],
			}),
			blockTSDown({
				entry: [
					"src/configs/recommended.ts",
					"!src/**/*.test.*",
					"!src/rules/ruleTester.ts",
					"!src/rules/sandbox/**",
				],
				properties: {
					// Keeps require("eslint-plugin-expect-type/configs/recommended").default working
					cjsDefault: false,
					format: ["cjs", "esm"],
				},
				runInCI: ["node ./dist/index.cjs", "node ./dist/index.mjs"],
			}),
			blockTypeScript({
				compilerOptions: {
					module: "ESNext",
					moduleResolution: "Bundler",
				},
			}),
		],
		blocks: {
			exclude: [blockExports, blockMITLicense],
		},
	},
});
