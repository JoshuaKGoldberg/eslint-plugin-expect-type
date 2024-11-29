# expect-type/expect

💼 This rule is enabled in the ✅ `recommended` config.

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

💭 This rule requires [type information](https://typescript-eslint.io/linting/typed-linting).

<!-- end auto-generated rule header -->

Enforces that types indicated in special comments match the types of code values.

> Types are compared with _"display"_ checking: a direct string comparison between their actual type and the string comment or snapshot.
> See [issue #18](https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues/18) for discussion around a new assertion for _"assignability"_ checking.

## Comment Types

The following kinds of comments are supported:

<!-- Markdownlint doesn't seem to understand the heading IDs... -->
<!-- markdownlint-disable link-fragments -->

- [`^?` (Twoslash Syntax)](#twoslash-syntax)
- [`$ExpectError`](#expecterror)
- [`$ExpectType`](#expecttype)
- [`$ExpectTypeSnapshot`](#expecttypesnapshot)

<!-- markdownlint-enable link-fragments -->

### Twoslash Syntax (`^?`)

Twoslash annotations are comment lines that start with two slashes (// ) and the ^? identifier to annotate a type below a value in code.
For example:

```ts
declare const getTextLength: (text: string) => number;

getTextLength("abc");
// ^? number

getTextLength;
// ^? (text: string) => number
```

Mismatching the type will cause a lint report:

```ts
"abc";
// ^? number
```

```plaintext
Expected type to be: number, got: string
```

Multiline type annotations are also supported:

```ts
const vector = {
	x: 3,
	y: 4,
};
vector;
// ^? const vector: {
//        x: number;
//        y: number;
//    }
```

### `$ExpectError`

Place this above a line of code to assert that it causes a TypeScript type error.

For example:

```ts
// $ExpectError
const value: number = "abc";
```

> ⚠️ `$ExpectError` does not suppress TypeScript type errors.
> Only TypeScript comment directives such as `// @ts-expect-error` may do that.
> See [#65](https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues/65).

### `$ExpectType`

A comment containing `// $ExpectType` and a type, placed above or on a line of code.
It asserts that the value of the line of code is of that type.

For example:

```ts
declare const getTextLength: (text: string) => number;

// $ExpectType number
getTextLength("abc");

// $ExpectType (text: string) => number
getTextLength;
```

Mismatching the type will cause a lint report:

```ts
// $ExpectType number
"abc";
```

```plaintext
Expected type to be: number, got: string
```

### `$ExpectTypeSnapshot`

Similar to `$ExpectType`, but instead of a type, takes in a unique ID for a snapshot.
The snapshot will then be saved in a `__type-snapshots__/*.snap.json` file alongside the original `*`-named source file.

For example, given a `file.ts`:

```ts
declare const getTextLength: (text: string) => number;

// $ExpectTypeSnapshot FunctionCallExpression
getTextLength("abc");

// $ExpectTypeSnapshot FunctionIdentifier
getTextLength;
```

...a `__type-snapshots__/file.ts.snap.json` file will be created containing:

```json
{
	"FunctionCallExpression": "number",
	"FunctionIdentifier": "(text: string) => number"
}
```

These snapshots will automatically update whenever `eslint --fix` is run.

> ⚠️ [#115](https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/issues/115): There are known issues around detecting whether to automatically update snapshots.
> Editor extensions are likely to not apply updates automatically.
> Try running ESLint with `--fix` on the command-line, or failing that, manually updating.

## Options

### `disableExpectTypeSnapshotFix`

Whether to disable `$ExpectTypeSnapshot` auto-fixing.
Defaults to `false`.

### `versionsToTest`

Array of TypeScript versions to test.
Defaults to only the installed version.

If provided, this must be an array of objects containing:

- `name: string`: Alias to refer to the TypeScript version
- `path: string`: Import path to `require()` TypeScript from

For example:

```json
[
	{
		"name": "current",
		"path": "typescript"
	},
	{
		"name": "5.0",
		"path": "typescript50"
	}
]
```

`versionsToTest` can be useful if you want to have a single lint job that checks multiple TypeScript versions (instead of a matrix of jobs).
