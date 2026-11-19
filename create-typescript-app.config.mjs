// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockESLint,
	blockMITLicense,
	blockPackageJson,
	blockTSDown,
	blockTypeScript,
	blockVitest,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		addons: [
			blockESLint({
				extensions: [
					{
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
			}),
			blockPackageJson({
				properties: {
					files: ["LICENSE.md"],
				},
			}),
			blockTSDown({
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
			blockVitest({
				exclude: ["src/index.ts", "src/rules/index.ts"],
			}),
		],
		blocks: {
			exclude: [blockMITLicense],
		},
	},
});
