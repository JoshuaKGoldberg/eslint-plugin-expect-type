<h1 align="center">eslint-plugin-expect-type</h1>

<p align="center">ESLint plugin with <code>^?</code> Twoslash, <code>$ExpectError</code>, and <code>$ExpectType</code> type assertions. 🧩</p>

<p align="center">
<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href="#contributors" target="_blank"><img alt="All Contributors: 15 👪" src="https://img.shields.io/badge/all_contributors-15_👪-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->
<a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="Contributor Covenant" src="https://img.shields.io/badge/code_of_conduct-enforced-21bb42" /></a>
<a href="https://codecov.io/gh/JoshuaKGoldberg/eslint-plugin-expect-type" target="_blank"><img alt="Codecov Test Coverage" src="https://codecov.io/gh/JoshuaKGoldberg/eslint-plugin-expect-type/branch/main/graph/badge.svg"/></a>
<a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/main/LICENSE.md" target="_blank"><img alt="License: Apache-2.0" src="https://img.shields.io/github/license/JoshuaKGoldberg/eslint-plugin-expect-type?color=21bb42"></a>
<img alt="npm package version" src="https://img.shields.io/npm/v/eslint-plugin-expect-type?color=21bb42" />
<img alt="TypeScript: Strict" src="https://img.shields.io/badge/typescript-strict-21bb42.svg" />

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

Add the following options to your [ESLint configuration file](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new):

```ts
import expectType from "eslint-plugin-expect-type/configs/recommended";

export default [
	// your other ESLint configurations
	expectType,
];
```

> For CommonJS, use `const expectType = require("eslint-plugin-expect-type/configs/recommended").default;`.

Then, you'll be able to use `^?`, `$ExpectError`, `$ExpectType`, and `$ExpectTypeSnapshot` comments in code assert on types.

### Usage (Legacy Config)

If you're still using the [legacy ESLint configuration file format](https://eslint.org/docs/latest/user-guide/configuring/configuration-files):

```json
{
	"extends": ["plugin:expect-type/recommended"],
	"plugins": ["expect-type"]
}
```

## Rules

<!-- prettier-ignore-start -->
<!-- begin auto-generated rules list -->

💼 Configurations enabled in.\
✅ Set in the `recommended` configuration.\
🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).\
💭 Requires [type information](https://typescript-eslint.io/linting/typed-linting).

| Name                           | Description                                 | 💼 | 🔧 | 💭 |
| :----------------------------- | :------------------------------------------ | :- | :- | :- |
| [expect](docs/rules/expect.md) | Expects type error, type snapshot, or type. | ✅  | 🔧 | 💭 |

<!-- end auto-generated rules list -->
<!-- prettier-ignore-end -->

## References

You might consider using other popular libraries and tools that can run type assertions:

- **[expect-type](https://github.com/mmkal/expect-type)**: Provides functions that return assorted generic type assertion methods, such as `expectTypeOf('abc').toMatchTypeOf<string>()`.
- **[ts-expect](https://github.com/TypeStrong/ts-expect)**: Provides generic type assertion function, used like `expectType<string>('abc')()`.
- **[tsd](https://github.com/SamVerschueren/tsd)**: Allows writing tests specifically for `.d.ts` definition files.
- **[TSTyche](https://tstyche.org)**: A type testing tool that ships with `describe()` and `test()` helpers, `expect` style assertions and a mighty test runner which allows to use specified version of TypeScript.
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
      <td align="center" valign="top" width="14.28%"><a href="https://blog.andrewbran.ch"><img src="https://avatars.githubusercontent.com/u/3277153?v=4?s=100" width="100px;" alt="Andrew Branch"/><br /><sub><b>Andrew Branch</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=andrewbranch" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/BatuhanW"><img src="https://avatars.githubusercontent.com/u/16444991?v=4?s=100" width="100px;" alt="Batuhan Wilhelm"/><br /><sub><b>Batuhan Wilhelm</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3ABatuhanW" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=BatuhanW" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://colinking.co/"><img src="https://avatars.githubusercontent.com/u/2907397?v=4?s=100" width="100px;" alt="Colin"/><br /><sub><b>Colin</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Acolinking" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://books.ninja-squad.com"><img src="https://avatars.githubusercontent.com/u/411874?v=4?s=100" width="100px;" alt="Cédric Exbrayat"/><br /><sub><b>Cédric Exbrayat</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Acexbrayat" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://effectivetypescript.com/"><img src="https://avatars.githubusercontent.com/u/98301?v=4?s=100" width="100px;" alt="Dan Vanderkam"/><br /><sub><b>Dan Vanderkam</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=danvk" title="Code">💻</a> <a href="#maintenance-danvk" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://danielnagy.me"><img src="https://avatars.githubusercontent.com/u/1622446?v=4?s=100" width="100px;" alt="Daniel Nagy"/><br /><sub><b>Daniel Nagy</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Adaniel-nagy" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TkDodo"><img src="https://avatars.githubusercontent.com/u/1021430?v=4?s=100" width="100px;" alt="Dominik Dorfmeister"/><br /><sub><b>Dominik Dorfmeister</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=TkDodo" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fasttime"><img src="https://avatars.githubusercontent.com/u/6367844?v=4?s=100" width="100px;" alt="Francesco Trotta"/><br /><sub><b>Francesco Trotta</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=fasttime" title="Code">💻</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Afasttime" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ibezkrovnyi"><img src="https://avatars.githubusercontent.com/u/1188919?v=4?s=100" width="100px;" alt="Igor Bezkrovnyi"/><br /><sub><b>Igor Bezkrovnyi</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3Aibezkrovnyi" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=ibezkrovnyi" title="Code">💻</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=ibezkrovnyi" title="Documentation">📖</a> <a href="#maintenance-ibezkrovnyi" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jakebailey.dev"><img src="https://avatars.githubusercontent.com/u/5341706?v=4?s=100" width="100px;" alt="Jake Bailey"/><br /><sub><b>Jake Bailey</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=jakebailey" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com/"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg ✨"/><br /><sub><b>Josh Goldberg ✨</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues?q=author%3AJoshuaKGoldberg" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/_RussellDavis"><img src="https://avatars.githubusercontent.com/u/551404?v=4?s=100" width="100px;" alt="Russell Davis"/><br /><sub><b>Russell Davis</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=russelldavis" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mrazauskas"><img src="https://avatars.githubusercontent.com/u/72159681?v=4?s=100" width="100px;" alt="Tom Mrazauskas"/><br /><sub><b>Tom Mrazauskas</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=mrazauskas" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/DetachHead"><img src="https://avatars.githubusercontent.com/u/57028336?v=4?s=100" width="100px;" alt="detachhead"/><br /><sub><b>detachhead</b></sub></a><br /><a href="#ideas-detachhead" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://nirtamir.com/"><img src="https://avatars.githubusercontent.com/u/16452789?v=4?s=100" width="100px;" alt="nirtamir2"/><br /><sub><b>nirtamir2</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/commits?author=nirtamir2" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->

> 💙 This package was templated with [create-typescript-app](https://github.com/JoshuaKGoldberg/create-typescript-app).
