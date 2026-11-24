import { defineConfig } from "tsdown";

export default defineConfig({
	cjsDefault: false,
	entry: ["src/index.ts", "src/configs/recommended.ts"],
	format: ["cjs", "esm"],
	unbundle: true,
});
