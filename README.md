# eslint-plugin-expect-type

ESLint plugin with $ExpectType and $ExpectError type assertions

## Installation

Make sure you have TypeScript and @typescript-eslint/parser installed, then install the plugin:

```sh
npm i -D eslint-plugin-expect-type
```

Please also make sure the following packages are also installed:

```sh
npm i -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

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

Rule severity could be configured as follows

```json
{
  "rules": {
    "expect-type/rule": "error"
  }
}
```

**Note: Make sure to use `eslint --ext .js,.ts` since by [default](https://eslint.org/docs/user-guide/command-line-interface#--ext) `eslint` will only search for .js files.**

# Adding $ExpectType and $ExpectError type assertions

> A test file should be a piece of sample code that tests using the library. Tests are type-checked, but not run. To assert that an expression is of a given type, use $ExpectType. To assert that an expression causes a compile error, use $ExpectError. (Assertions will be checked by the expect lint rule.)

(https://github.com/Microsoft/dtslint#write-tests)

```ts
import foo from 'lib-to-test'; // foo is (n: number) => void

// $ExpectType void
foo(1);

// Can also write the assertion on the same line.
foo(2); // $ExpectType void

// $ExpectError
foo('bar');
```

# Adding \$ExpectTypeSnapshot

Uses snapshot saved in file as expected type for expression.

Example:

**foo.test.ts**

```ts
// $ExpectTypeSnapshot MyFooSnapshot
const Foo = {
  a: 1,
  n: 17,
} as const;
```

By running `eslint --fix` the following file will be created in the folder of `foo.test.ts`:
```
__type-snapshots__/foo.test.ts.snap.json
```

By running `eslint` snapshot type will be matched with actual type and Error will be emitted in case types don't match.

## To create/update snapshots:

```sh
eslint --fix
```

# References

1. https://github.com/gcanti/dtslint
2. https://github.com/Microsoft/dtslint
3. https://github.com/SamVerschueren/tsd
