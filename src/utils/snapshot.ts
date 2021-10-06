import { dirname, resolve, basename } from 'path';
import { ensureFileSync, readJsonSync, writeJsonSync } from 'fs-extra';

export const getTypeSnapshot = (filename: string, snapshotName: string) => {
  const snapshotPath = getSnapshotPath(filename);
  const json = readJsonSync(snapshotPath, { throws: false });
  if (!json) {
    return;
  }
  return json[snapshotName] as string;
};

export const updateTypeSnapshot = (filename: string, snapshotName: string, actualType: string) => {
  const snapshotPath = getSnapshotPath(filename);
  ensureFileSync(snapshotPath);

  const json = readJsonSync(snapshotPath, { throws: false }) || {};
  json[snapshotName] = actualType;
  writeJsonSync(snapshotPath, json, { spaces: 2 });
};

function getSnapshotPath(filename: string) {
  const directory = dirname(filename);
  return resolve(directory, '__type-snapshots__', `${basename(filename)}.snap.json`);
}
