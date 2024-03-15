# types-react-codemod

## 3.1.0

### Minor Changes

- Add codemod to replace deprecated `ReactFragment` by inlining its actual type ([#326](https://github.com/eps1lon/types-react-codemod/pull/326) [`ed97a70`](https://github.com/eps1lon/types-react-codemod/commit/ed97a701c9802b5b53e0a3b9da04f519793eddf3) by [@eps1lon](https://github.com/eps1lon))

  ```diff
  import * as React from 'react';

  -const node: React.ReactFragment
  +const node: Iterable<React.ReactNode>
  ```

- Add codemod to replace deprecated React types related to propTypes with their counterpart from the `prop-types` package ([#357](https://github.com/eps1lon/types-react-codemod/pull/357) [`1751318`](https://github.com/eps1lon/types-react-codemod/commit/1751318d6189fd2d44875292b6b6c23af5678d6a) by [@eps1lon](https://github.com/eps1lon))

  ```diff
  +import * as PropTypes from "prop-types";
   import * as React from "react";
  -declare const requireable: React.Requireable<React.ReactNode>;
  +declare const requireable: PropTypes.Requireable<React.ReactNode>;
  -declare const validator: React.Validator<React.ReactNode>;
  +declare const requireable: PropTypes.Validator<React.ReactNode>;
  -declare const validationMap: React.ValidationMap<{}>;
  +declare const requireable: PropTypes.ValidationMap<React.ReactNode>;
  -declare const weakValidationMap: React.WeakValidationMap<{}>;
  +declare const requireable: PropTypes.WeakValidationMap<React.ReactNode>;
  ```

- Add codemod for required initial value in `useRef` ([#217](https://github.com/eps1lon/types-react-codemod/pull/217) [`0047404`](https://github.com/eps1lon/types-react-codemod/commit/0047404d18665a2b18c0859e013d643022fc23e5) by [@eps1lon](https://github.com/eps1lon))

  Added as `useRef-required-initial`.
  Can be used on 18.x types but only intended for once https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64920 lands.

- Unflag codemods for new refs ([#319](https://github.com/eps1lon/types-react-codemod/pull/319) [`80fe29c`](https://github.com/eps1lon/types-react-codemod/commit/80fe29c4bde096d5f18ec5d7bac55ad27c5c9718) by [@eps1lon](https://github.com/eps1lon))

  Just removing their experimental prefix since we have increased confidence in these changes after seeing their impact internally.

  ```diff
  -experimental-refobject-defaults
  +refobject-defaults
  ```

- Add codemod to replace `LegacyRef` with `Ref` ([#347](https://github.com/eps1lon/types-react-codemod/pull/347) [`e928761`](https://github.com/eps1lon/types-react-codemod/commit/e9287614259225cab789ed4cbf570c2940050cab) by [@eps1lon](https://github.com/eps1lon))

- Add codemod to replace deprecated `ReactNodeArray` by inlining its actual type. ([#325](https://github.com/eps1lon/types-react-codemod/pull/325) [`b7f757c`](https://github.com/eps1lon/types-react-codemod/commit/b7f757c08c1bbfa5ceecf47c937cfd588b37d1db) by [@eps1lon](https://github.com/eps1lon))

  ```diff
  import * as React from 'react';

  -const node: React.ReactNodeArray
  +const node: ReadonlyArray<React.ReactNode>
  ```

### Patch Changes

- Added missing transforms as choices to preset-19 ([#341](https://github.com/eps1lon/types-react-codemod/pull/341) [`dc10a3d`](https://github.com/eps1lon/types-react-codemod/commit/dc10a3de2fccc7fcc31e73bd655fac0f45977392) by [@eps1lon](https://github.com/eps1lon))

- Ensure added imports of types use the `type` modifier ([#343](https://github.com/eps1lon/types-react-codemod/pull/343) [`f05624f`](https://github.com/eps1lon/types-react-codemod/commit/f05624f41f66504293066d36b07a9b1f22b62ea2) by [@eps1lon](https://github.com/eps1lon))

  If we'd previously add an import to `JSX` (e.g. in `scoped-jsx`),
  the codemod would import it as a value.
  This breaks TypeScript projects using `verbatimModuleSyntax` as well as projects enforcing `type` imports for types.

  Now we ensure new imports of types use the `type` modifier:

  ```diff
  -import { JSX } from 'react'
  +import { type JSX } from 'react'
  ```

  This also changes how we transform the deprecated global JSX namespace.
  Instead of rewriting each usage, we opt for adding another import.
  The guiding principle being that we keep the changes minimal in a codemod.

  Before:

  ```diff
  import * as React from 'react'

  -const element: JSX.Element
  +const element: React.JSX.Element
  ```

  After:

  ```diff
  import * as React from 'react'
  +import { type JSX } from 'react'

  const element: JSX.Element
  ```

  Note that rewriting of imports does not change the modifier.
  For example, the `deprecated-vfc-codemod` rewrites `VFC` identifiers to `FC`.
  If the import of `VFC` had no `type` modifier, the codemod will not add one.

  `type` modifiers for import specifiers require [TypeScript 4.5 which has reached EOL](https://github.com/DefinitelyTyped/DefinitelyTyped#support-window in DefinitelyTyped) which is a strong signal that you should upgrade to at least TypeScript 4.6 by now.

- Ensure replace and rename codemods have consistent behavior ([#348](https://github.com/eps1lon/types-react-codemod/pull/348) [`a62832e`](https://github.com/eps1lon/types-react-codemod/commit/a62832e496b4c0a77119d3115cf1c157c1c04e29) by [@eps1lon](https://github.com/eps1lon))

  Fixes multiple incorrect transform patterns that were supported by some transforms but not others.
  We no longer switch to `type` imports if the original type wasn't imported with that modifier.
  Type parameters are now consistently preserved.
  We don't add a reference to the `React` namespace anymore if we can just add a type import.

  This affects the following codemods:

  - `deprecated-legacy-ref`
  - `deprecated-react-child`
  - `deprecated-react-text`
  - `deprecated-react-type`
  - `deprecated-sfc-element`
  - `deprecated-sfc`
  - `deprecated-stateless-component`
  - `deprecated-void-function-component`

- Find and replace type usage in type parameters of call expressions ([#344](https://github.com/eps1lon/types-react-codemod/pull/344) [`8c27551`](https://github.com/eps1lon/types-react-codemod/commit/8c275511d46cd2320c9075e9e15b82f9f3aa1309) by [@eps1lon](https://github.com/eps1lon))

  Now we properly detect that e.g. `JSX` is used in `someFunctionWithTypeParameters<JSX>()`.

  Affected codemods:

  - `deprecated-react-child`
  - `deprecated-react-text`
  - `scoped-jsx`

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
