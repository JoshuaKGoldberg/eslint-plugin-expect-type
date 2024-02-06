import path from "node:path";

export function findUp<T>(
	p: string,
	fn: (p: string) => T | undefined,
): T | undefined {
	p = path.resolve(p);
	const root = path.parse(p).root;

	while (true) {
		const v = fn(p);
		if (v !== undefined) {
			return v;
		}

		if (p === root) {
			break;
		}

		p = path.dirname(p);
	}

	return undefined;
}
