// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockESLint,
	blockExports,
	blockMITLicense,
	blockPackageJson,
	blockTSDown,
	blockTypeScript,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		addons: [
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
				],
				ignores: ["src/rules/sandbox/**"],
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
					files: ["LICENSE.md"],
					main: "./dist/index.cjs",
					type: "module",
				},
			}),
			blockTSDown({
				entry: [
					"!src/**/*.test.*",
					"!src/rules/ruleTester.ts",
					"!src/rules/sandbox/**",
				],
				properties: {
					format: ["cjs", "esm"],
				},
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
