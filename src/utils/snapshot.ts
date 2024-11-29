import * as fse from "fs-extra";
import { basename, dirname, resolve } from "path";

// https://github.com/DefinitelyTyped/DefinitelyTyped/pull/63859#issuecomment-1541956062
const { ensureFileSync, readJsonSync, writeJsonSync } = fse;

export const getTypeSnapshot = (filename: string, snapshotName: string) => {
	const snapshotPath = getSnapshotPath(filename);
	const json = readJsonSync(snapshotPath, { throws: false }) as
		| Record<string, string>
		| undefined;
	if (!json) {
		return;
	}

	return json[snapshotName];
};

export const updateTypeSnapshot = (
	filename: string,
	snapshotName: string,
	actualType: null | string,
) => {
	const snapshotPath = getSnapshotPath(filename);
	ensureFileSync(snapshotPath);

	const json =
		(readJsonSync(snapshotPath, { throws: false }) as
			| Record<string, null | string>
			| undefined) ?? {};
	json[snapshotName] = actualType;
	writeJsonSync(snapshotPath, json, { spaces: 2 });
};

function getSnapshotPath(filename: string) {
	const directory = dirname(filename);
	return resolve(
		directory,
		"__type-snapshots__",
		`${basename(filename)}.snap.json`,
	);
}
