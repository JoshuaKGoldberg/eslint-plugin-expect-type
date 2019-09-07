# eslint-plugin-expect-type

> ESLint plugin with $ExpectType and $ExpectError type assertions

## Installation

Make sure you have TypeScript and @typescript-eslint/parser installed, then install the plugin:

```sh
npm i -D eslint-plugin-expect-type
```

It is important that you use the same version number for `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`.

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `@typescript-eslint/eslint-plugin` globally.

## Usage

Please add the following options to your `.eslintrc`

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["eslint-plugin-expect-type"],
  "extends": ["plugin:eslint-plugin-expect-type/recommended"]
}
```

**Note: Make sure to use `eslint --ext .js,.ts` since by [default](https://eslint.org/docs/user-guide/command-line-interface#--ext) `eslint` will only search for .js files.**

# References

1. https://github.com/Microsoft/dtslint
2. https://github.com/SamVerschueren/tsd
