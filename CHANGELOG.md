# types-react-codemod

## 3.0.0

### Major Changes

- [#304](https://github.com/eps1lon/types-react-codemod/pull/304) [`0730d90553bd7dfc889a1325c9e975c16f367439`](https://github.com/eps1lon/types-react-codemod/commit/0730d90553bd7dfc889a1325c9e975c16f367439) Thanks [@renovate](https://github.com/apps/renovate)! - Update Node.js support matrix

  Drop support for unmaintained Node.js versions (14.x, 16.x, 17.x, and 19.x) to reduce maintenance cost.

### Minor Changes

- [#214](https://github.com/eps1lon/types-react-codemod/pull/214) [`10fb254afbccab5e7e1941bfee49f957ca7ed1a5`](https://github.com/eps1lon/types-react-codemod/commit/10fb254afbccab5e7e1941bfee49f957ca7ed1a5) Thanks [@eps1lon](https://github.com/eps1lon)! - Add scoped-jsx transform

  This replaces usage of the deprecated global JSX namespace with usage of the scoped namespace:

  ```diff
  +import { JSX } from 'react'

   const element: JSX.Element
  ```

## 2.1.0

### Minor Changes

- [#208](https://github.com/eps1lon/types-react-codemod/pull/208) [`b76beab`](https://github.com/eps1lon/types-react-codemod/commit/b76beabace7314f98157c37d67aca48551bff477) Thanks [@eps1lon](https://github.com/eps1lon)! - Add experimental (not for use in published types) `experimental-refobject-defaults` codemod for new `RefObject` behavior

  See [[react] Make all refs mutable by default #64896](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64896)

### Patch Changes

- [#248](https://github.com/eps1lon/types-react-codemod/pull/248) [`0dd5d20`](https://github.com/eps1lon/types-react-codemod/commit/0dd5d20181a21cb1212875e5c4e4fab6a1486a46) Thanks [@dgarciamuria](https://github.com/dgarciamuria)! - Add missing `@babel/parser` dependency

## 2.0.1

### Patch Changes

- [#210](https://github.com/eps1lon/types-react-codemod/pull/210) [`a47bd09`](https://github.com/eps1lon/types-react-codemod/commit/a47bd09809991be0c89922dcbe6ba616a270d94e) Thanks [@eps1lon](https://github.com/eps1lon)! - Ensure jscodeshift can be executed

  Fixes `/usr/bin/env: ‘node\r’: No such file or directory`

## 2.0.0

### Major Changes

- [#143](https://github.com/eps1lon/types-react-codemod/pull/143) [`b3351d2`](https://github.com/eps1lon/types-react-codemod/commit/b3351d28cad7dade2a70bbec913582aacc7488c2) Thanks [@eps1lon](https://github.com/eps1lon)! - Fail install if used version of Node.js is not officially supported

  Add a list of supported versions of Node.js to `engines` in `package.json`.
  If the current version does not match, installation will fail (by default in Yarn and in NPM only if the [`engine-strict` config is enabled](https://docs.npmjs.com/cli/v8/using-npm/config#engine-strict)).

  This warning can be ignored either by setting `engine-strict` to `false` in NPM (default) or add `--ignore-engines` to `yarn` (e.g. `yarn --ignore-engines`).

## 1.3.0

### Minor Changes

- [#92](https://github.com/eps1lon/types-react-codemod/pull/92) [`0d92140`](https://github.com/eps1lon/types-react-codemod/commit/0d92140edabcb94e25aa4b7cef9340a7b13c110b) Thanks [@eps1lon](https://github.com/eps1lon)! - Ensure TypeScript instantiation expressions can be parsed

  [Instantiation expressions](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#instantiation-expressions) were added in TypeScript 4.7.

## 1.2.1

### Patch Changes

- [#69](https://github.com/eps1lon/types-react-codemod/pull/69) [`52da899`](https://github.com/eps1lon/types-react-codemod/commit/52da899062db71f28656b94a0c0b08d1b6c019fd) Thanks [@eps1lon](https://github.com/eps1lon)! - Don't use `import` statement.

  Fixes errors like "SyntaxError: Cannot use import statement outside a module".

## 1.2.0

### Minor Changes

- [#63](https://github.com/eps1lon/types-react-codemod/pull/63) [`15ec796`](https://github.com/eps1lon/types-react-codemod/commit/15ec79609eae3029abeb2aa22752a74ab508af7a) Thanks [@eps1lon](https://github.com/eps1lon)! - Avoid transpiling transforms

  Previously jscodeshift would transpile the transforms before using them.
  This was largely unnecessary and resulted in bugs to to usage of undeclared Babel dependencies.

## 1.1.0

### Minor Changes

- [#44](https://github.com/eps1lon/types-react-codemod/pull/44) [`85bae50`](https://github.com/eps1lon/types-react-codemod/commit/85bae50c34a1fd5bc9245dd770ca8893eb0867d2) Thanks [@eps1lon](https://github.com/eps1lon)! - Add `deprecated-react-text` and `preset-19`.

* [#50](https://github.com/eps1lon/types-react-codemod/pull/50) [`769a434`](https://github.com/eps1lon/types-react-codemod/commit/769a434e1fa40c68846bb9a43b84d15b3ae16541) Thanks [@eps1lon](https://github.com/eps1lon)! - Add `deprecated-react-child` transform.

  Part of `preset-19`.

- [#52](https://github.com/eps1lon/types-react-codemod/pull/52) [`d3660ef`](https://github.com/eps1lon/types-react-codemod/commit/d3660ef923ca91ff527071a79bc2241559560199) Thanks [@eps1lon](https://github.com/eps1lon)! - Add `deprecated-void-function-component` transform.

  Part of `preset-19`.

### Patch Changes

- [#51](https://github.com/eps1lon/types-react-codemod/pull/51) [`d5aa8f3`](https://github.com/eps1lon/types-react-codemod/commit/d5aa8f33d502e047d7ed60a180bda08984010cec) Thanks [@eps1lon](https://github.com/eps1lon)! - Display version from package.json instead of hardcoded one.

## 1.0.2

### Patch Changes

- [#46](https://github.com/eps1lon/types-react-codemod/pull/46) [`c0784a7`](https://github.com/eps1lon/types-react-codemod/commit/c0784a7b9d76d480a4e5aaa5dcaf1313a3effe5e) Thanks [@eps1lon](https://github.com/eps1lon)! - Parse .ts files without JSX plugin.

  Otherwise code such as

  ```ts
  (<RegExp>expected).test(object);
  ```

  -- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3eacc5e0b7c56d2670a5a0e68735f7638e8f38f3/types/chai-like/chai-like-tests.ts#L15

  could not be parsed.

## 1.0.1

### Patch Changes

- [#33](https://github.com/eps1lon/types-react-codemod/pull/33) [`59e5624`](https://github.com/eps1lon/types-react-codemod/commit/59e56241e7a3f39b2e7c4983662fcb76691e265b) Thanks [@eps1lon](https://github.com/eps1lon)! - Remove repository config files from release.

  These files are only relevant for development.

* [#40](https://github.com/eps1lon/types-react-codemod/pull/40) [`e425cc9`](https://github.com/eps1lon/types-react-codemod/commit/e425cc954bb083bcde44178ce91d6064269f73a6) Thanks [@eps1lon](https://github.com/eps1lon)! - Remove test files from release.

  There's a charm to having these in the release but nobody reads them anyway.
  And for testing you need the dev setup which is probably not available if inside node_modules.

## 1.0.0

### Major Changes

- [#22](https://github.com/eps1lon/types-react-codemod/pull/22) [`18339c2`](https://github.com/eps1lon/types-react-codemod/commit/18339c20e36b4355bed924c6aa3b069317a34c1c) Thanks [@eps1lon](https://github.com/eps1lon)! - Release 1.0.0

  Includes no breaking changes.
  Just marking this release as mature by not using the 0.x range.

## 0.1.0

### Minor Changes

- [#13](https://github.com/eps1lon/types-react-codemod/pull/13) [`5da481a`](https://github.com/eps1lon/types-react-codemod/commit/5da481a4e669d12ea4f68617da4da62c5342ede5) Thanks [@eps1lon](https://github.com/eps1lon)! - Add `preset-18` codemod

* [#12](https://github.com/eps1lon/types-react-codemod/pull/12) [`ffafd3d`](https://github.com/eps1lon/types-react-codemod/commit/ffafd3dc7ba3aa21fe3f262bfc2454b00b5410ec) Thanks [@eps1lon](https://github.com/eps1lon)! - Implement `context-any` transform

- [#4](https://github.com/eps1lon/types-react-codemod/pull/4) [`c8e8ec6`](https://github.com/eps1lon/types-react-codemod/commit/c8e8ec688d95aa3ec6fafa394bc916332c546ffd) Thanks [@eps1lon](https://github.com/eps1lon)! - Implement `deprecated-stateless-component` transform.

* [#11](https://github.com/eps1lon/types-react-codemod/pull/11) [`722d1fd`](https://github.com/eps1lon/types-react-codemod/commit/722d1fd40c357bf7b044a6b77e4a9018f362520d) Thanks [@eps1lon](https://github.com/eps1lon)! - Implement `implicit-children` transform

- [#17](https://github.com/eps1lon/types-react-codemod/pull/17) [`0ea3337`](https://github.com/eps1lon/types-react-codemod/commit/0ea3337d65a04e05aaf2bbef1e202c1ee3ecae8b) Thanks [@eps1lon](https://github.com/eps1lon)! - Add `--ignore-pattern` option to CLI

### Patch Changes

- [#18](https://github.com/eps1lon/types-react-codemod/pull/18) [`bbf4b16`](https://github.com/eps1lon/types-react-codemod/commit/bbf4b1617686e40032b8ff7b9f708c0f58c7513a) Thanks [@eps1lon](https://github.com/eps1lon)! - Document usage of CLI and each transform
