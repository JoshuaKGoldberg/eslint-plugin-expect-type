import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import { getProgramForVersion } from "./programs.js";

const mockGetHeapStatistics = vi.fn<() => Record<string, number>>();

vi.mock("node:v8", () => ({
	get default() {
		return { getHeapStatistics: mockGetHeapStatistics };
	},
}));

const originalProgram = ts.createProgram({
	options: {},
	rootNames: [],
});

function actGetProgramForVersion() {
	return getProgramForVersion("tsconfig.json", ts, "current", originalProgram);
}

describe("getProgramForVersion", () => {
	it("reuses old programs when <90% of the heap is used", () => {
		mockGetHeapStatistics.mockReturnValue({
			heap_size_limit: 100,
			used_heap_size: 90,
		});

		const programA = actGetProgramForVersion();
		const programB = actGetProgramForVersion();

		expect(programA).toBe(programB);
	});

	it("does not reuse old programs when >90% of the heap is used", () => {
		mockGetHeapStatistics.mockReturnValue({
			heap_size_limit: 100,
			used_heap_size: 91,
		});

		const programA = actGetProgramForVersion();
		const programB = actGetProgramForVersion();

		expect(programA).not.toBe(programB);
	});
});
