import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getTypeSnapshot, updateTypeSnapshot } from "./snapshot.js";

describe("updateTypeSnapshot", () => {
	let directory: string;
	let filename: string;
	let snapshotPath: string;

	beforeEach(() => {
		directory = fs.mkdtempSync(path.join(os.tmpdir(), "expect-type-"));
		filename = path.join(directory, "file.ts");
		snapshotPath = path.join(
			directory,
			"__type-snapshots__",
			"file.ts.snap.json",
		);
	});

	afterEach(() => {
		fs.rmSync(directory, { force: true, recursive: true });
	});

	it("writes a new snapshot file with two-space indentation", () => {
		updateTypeSnapshot(filename, "Example", "number");

		expect(fs.readFileSync(snapshotPath, "utf8")).toBe(
			'{\n  "Example": "number"\n}\n',
		);
		expect(getTypeSnapshot(filename, "Example")).toBe("number");
	});

	it("preserves tab indentation in an existing snapshot file", () => {
		fs.mkdirSync(path.dirname(snapshotPath));
		fs.writeFileSync(snapshotPath, '{\n\t"Existing": "string"\n}\n');

		updateTypeSnapshot(filename, "Example", "number");

		expect(fs.readFileSync(snapshotPath, "utf8")).toBe(
			'{\n\t"Existing": "string",\n\t"Example": "number"\n}\n',
		);
	});

	it("preserves four-space indentation in an existing snapshot file", () => {
		fs.mkdirSync(path.dirname(snapshotPath));
		fs.writeFileSync(snapshotPath, '{\n    "Existing": "string"\n}\n');

		updateTypeSnapshot(filename, "Example", "number");

		expect(fs.readFileSync(snapshotPath, "utf8")).toBe(
			'{\n    "Existing": "string",\n    "Example": "number"\n}\n',
		);
	});
});
