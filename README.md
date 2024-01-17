<h1 align="center">eslint-plugin-expect-type</h1>

<p align="center">ESLint plugin with `^?` Twoslash, `$ExpectError`, and `$ExpectType` type assertions. 🧩</p>

<p align="center">
	<a href="#contributors" target="_blank">
<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<img alt="All Contributors: 9 👪" src="https://img.shields.io/badge/all_contributors-9_👪-21bb42.svg" />
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->
</a>
	<a href="https://codecov.io/gh/JoshuaKGoldberg/eslint-plugin-expect-type" target="_blank">
		<img alt="Codecov Test Coverage" src="https://codecov.io/gh/JoshuaKGoldberg/eslint-plugin-expect-type/branch/main/graph/badge.svg"/>
	</a>
	<a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank">
		<img alt="Contributor Covenant" src="https://img.shields.io/badge/code_of_conduct-enforced-21bb42" />
	</a>
	<a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/main/LICENSE.md" target="_blank">
		<img alt="License: Apache-2.0" src="https://img.shields.io/github/license/JoshuaKGoldberg/eslint-plugin-expect-type?color=21bb42">
	</a>
	<img alt="Style: Prettier" src="https://img.shields.io/badge/style-prettier-21bb42.svg" />
	<img alt="TypeScript: Strict" src="https://img.shields.io/badge/typescript-strict-21bb42.svg" />
	<img alt="npm package version" src="https://img.shields.io/npm/v/eslint-plugin-expect-type?color=21bb42" />
	<img alt="Contributor Covenant" src="https://img.shields.io/badge/code_of_conduct-enforced-21bb42" />
</p>

```ts
let value = 9001;
//  ^? let value: number

// $ExpectError
value = "over nine thousand";

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

| Name                           | Description                                 | 💼 | 🔧 | 💭 |
| :----------------------------- | :------------------------------------------ | :- | :- | :- |
| [expect](docs/rules/expect.md) | Expects type error, type snapshot, or type. | ✅  | 🔧 | 💭 |

<!-- end auto-generated rules list -->
<!-- prettier-ignore-end -->

## References

You might consider using other popular type assertion libraries in the TypeScript ecosystem:

- **[expect-type](https://github.com/mmkal/expect-type)**: Provides functions that return assorted generic type assertion methods, such as `expectTypeOf('abc').toMatchTypeOf<string>()`.
- **[ts-expect](https://github.com/TypeStrong/ts-expect)**: Provides generic type assertion function, used like `expectType<string>('abc')()`.
- **[tsd](https://github.com/SamVerschueren/tsd)**: Allows writing tests specifically for `.d.ts` definition files.
- **[Vitest](https://vitest.dev/guide/testing-types.html)**: Includes `assertType` and `expectTypeOf` assertions.

## TypeScript Version Support

`eslint-plugin-expect-type` mirrors the [DefinitelyTyped TypeScript Support Window](https://github.com/DefinitelyTyped/DefinitelyTyped/#support-window).
Roughly, that's major versions of TypeScript less than 2 years old.

## Appreciation

Many thanks to [@ibezkrovnyi](https://github.com/ibezkrovnyi) for creating the initial version and core infrastructure of this package! 💖

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/BatuhanW"><img src="https://avatars.githubusercontent.com/u/16444991?v=4?s=100" width="100px;" alt="Batuhan Wilhelm"/><br /><sub><b>Batuhan Wilhelm</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3ABatuhanW" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=BatuhanW" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://colinking.co/"><img src="https://avatars.githubusercontent.com/u/2907397?v=4?s=100" width="100px;" alt="Colin"/><br /><sub><b>Colin</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Acolinking" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://effectivetypescript.com/"><img src="https://avatars.githubusercontent.com/u/98301?v=4?s=100" width="100px;" alt="Dan Vanderkam"/><br /><sub><b>Dan Vanderkam</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=danvk" title="Code">💻</a> <a href="#maintenance-danvk" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://danielnagy.me"><img src="https://avatars.githubusercontent.com/u/1622446?v=4?s=100" width="100px;" alt="Daniel Nagy"/><br /><sub><b>Daniel Nagy</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Adaniel-nagy" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TkDodo"><img src="https://avatars.githubusercontent.com/u/1021430?v=4?s=100" width="100px;" alt="Dominik Dorfmeister"/><br /><sub><b>Dominik Dorfmeister</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=TkDodo" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ibezkrovnyi"><img src="https://avatars.githubusercontent.com/u/1188919?v=4?s=100" width="100px;" alt="Igor Bezkrovnyi"/><br /><sub><b>Igor Bezkrovnyi</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Aibezkrovnyi" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=ibezkrovnyi" title="Code">💻</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=ibezkrovnyi" title="Documentation">📖</a> <a href="#maintenance-ibezkrovnyi" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3AJoshuaKGoldberg" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/_RussellDavis"><img src="https://avatars.githubusercontent.com/u/551404?v=4?s=100" width="100px;" alt="Russell Davis"/><br /><sub><b>Russell Davis</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=russelldavis" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://nirtamir.com/"><img src="https://avatars.githubusercontent.com/u/16452789?v=4?s=100" width="100px;" alt="nirtamir2"/><br /><sub><b>nirtamir2</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=nirtamir2" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

> 💙 This package was templated with [create-typescript-app](https://github.com/JoshuaKGoldberg/create-typescript-app).
