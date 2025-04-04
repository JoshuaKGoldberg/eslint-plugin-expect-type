// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockESLint,
	blockMarkdownlint,
	blockMITLicense,
	blockPackageJson,
	blockTSup,
	blockTypeScript,
	blockVitest,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		addons: [
			blockESLint({
				ignores: ["README.md/*.ts", "src/rules/sandbox/*"],
				rules: [
					{
						entries: {
							"@typescript-eslint/no-unnecessary-condition": [
								"error",
								{ allowConstantLoopConditions: "only-allowed-literals" },
							],
						},
					},
				],
			}),
			blockMarkdownlint({
				ignores: ["LICENSE.md"],
			}),
			blockPackageJson({
				properties: {
					files: ["LICENSE.md"],
				},
			}),
			blockTSup({
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
