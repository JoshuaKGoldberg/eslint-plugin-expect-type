import { Linter } from 'eslint';
import * as path from 'path';

export const filename = path.join(__dirname, '..', 'sandbox', 'file.ts');

export const typescript: Linter.Config = {
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    sourceType: 'module',
    project: path.join(path.dirname(filename), 'tsconfig.json'),
  },
};
