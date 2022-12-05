# eslint-plugin-expect-type

> ESLint plugin with `^?` Twoslash, `$ExpectError`, and `$ExpectType` type assertions. ✨

```ts
9001;
// ^? number

// $ExpectError
const value: string = 9001;

// $ExpectType number
9001;
```

## Installation

Make sure you have TypeScript and @typescript-eslint/parser installed, then install the plugin:

```sh
npm i -D eslint-plugin-expect-type
```

> See [typescript-eslint's Getting Started docs](https://typescript-eslint.io/docs) for how to run ESLint on TypeScript files.

## Usage

Add the following options to your [ESLint configuration file](https://eslint.org/docs/latest/user-guide/configuring/configuration-files):

```json
{
  "extends": ["plugin:expect-type/recommended"],
  "plugins": ["eslint-plugin-expect-type"]
}
```

Then, you'll be able to use `^?`, `$ExpectError`, `$ExpectType`, and `$ExpectTypeSnapshot` comments in code assert on types.

<!-- prettier-ignore-start -->
<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💭 Requires type information.

| Name                           | Description                                | 💼 | 🔧 | 💭 |
| :----------------------------- | :----------------------------------------- | :- | :- | :- |
| [expect](docs/rules/expect.md) | Expects type error, type snapshot or type. | ✅  | 🔧 | 💭 |

<!-- end auto-generated rules list -->
<!-- prettier-ignore-end -->

## References

You might consider using other popular type assertion libraries in the TypeScript ecosystem:

- **[expect-type](https://github.com/mmkal/expect-type)**: Provides functions that return assorted generic type assertion methods, such as `expectTypeOf('abc').toMatchTypeOf<string>()`.
- **[ts-expect](https://github.com/mmkal/expect-type)**: Provides generic type assertion function, used like `expectType<string>('abc')()`.
- **[tsd](https://github.com/SamVerschueren/tsd)**: Allows writing tests specifically for `.d.ts` definition files.

## Appreciation

Many thanks to [@ibezkrovnyi](https://github.com/ibezkrovnyi) for creating the initial version and core infrastructure of this package! 💖
