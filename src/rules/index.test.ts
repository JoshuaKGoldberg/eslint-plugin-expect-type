import * as fs from "fs";
import { describe, expect, it } from "vitest";

import { rules } from "../../src/rules/index.js";

describe("./src/rules/index.ts", () => {
	const rulesNames: readonly string[] = Object.keys(rules);
	const files: readonly string[] = fs
		.readdirSync("./src/rules")
		.filter((file) => file !== "index.ts" && file.endsWith(".ts"));

	it("imports all available rule modules", () => {
		expect(rulesNames).toHaveLength(files.length);
	});
});
