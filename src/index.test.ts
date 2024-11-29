import { describe, expect, it } from "vitest";

import * as index from "./index.js";

describe("index", () => {
	it("matches the expected shape", () => {
		expect({
			...index,
			rules: Object.keys(index.rules),
		}).toMatchInlineSnapshot(`
			{
			  "configs": {
			    "recommended": {
			      "plugins": [
			        "expect-type",
			      ],
			      "rules": {
			        "expect-type/expect": "error",
			      },
			    },
			  },
			  "rules": [
			    "expect",
			  ],
			}
		`);
	});
});
