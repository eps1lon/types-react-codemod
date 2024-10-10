# types-react-codemod

Collection of transforms for [jscodeshift](https://github.com/facebook/jscodeshift) related to `@types/react`.

## Getting started

The codemod helps to fix potential TypeScript compile errors when upgrading to `@types/react@^18.0.0`.
However, we recommend to apply this codemod if you're using `@types/react@^17.0.30`.

```bash
$ npx types-react-codemod preset-18 ./src
? Pick transforms to apply (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proce
ed)
❯◯ context-any
 ◉ deprecated-react-type
 ◉ deprecated-sfc-element
 ◉ deprecated-sfc
 ◉ deprecated-stateless-component
 ◯ implicit-children
 ◯ useCallback-implicit-any
All done.
Results:
0 errors
20 unmodified
0 skipped
3 ok
Time elapsed: 0.229seconds
```

## Usage

```bash
$ npx types-react-codemod <codemod> <paths...>

Positionals:
  codemod  [string] [required] [choices: "context-any", "deprecated-legacy-ref",
                        "deprecated-prop-types-types", "deprecated-react-child",
                     "deprecated-react-fragment", "deprecated-react-node-array",
     "deprecated-react-text", "deprecated-react-type", "deprecated-sfc-element",
                             "deprecated-sfc", "deprecated-stateless-component",
                      "deprecated-void-function-component", "implicit-children",
                    "no-implicit-ref-callback-return", "preset-18", "preset-19",
          "react-element-default-any-props", "refobject-defaults", "scoped-jsx",
                          "useCallback-implicit-any", "useRef-required-initial"]
  paths                                                      [string] [required]

Options:
  --version         Show version number                                [boolean]
  --help            Show help                                          [boolean]
  --dry                                               [boolean] [default: false]
  --ignore-pattern                      [string] [default: "**/node_modules/**"]
  --verbose                                           [boolean] [default: false]

Examples:
  types-react-codemod preset-18 ./          Ignores `node_modules` and `build`
  --ignore-pattern                          folders
  "**/{node_modules,build}/**"
```

## Available transforms

The transforms are meant to migrate old code.
The transformed code is not intended to be used as a pattern for new code.

Some transforms change code they shouldn't actually change.
Fixing all of these requires a lot of implementation effort.
When considering false-positives vs false-negatives, codemods opt for false-positives.
The reason being that a false-positive can be reverted easily (assuming you have the changed code in Version Control e.g. git) while a false-negative requires manual input.

- `preset-18`
  - `deprecated-react-type`
  - `deprecated-sfc-element`
  - `deprecated-sfc`
  - `deprecated-stateless-component`
  - `context-any`
  - `implicit-children`
  - `useCallback-implicit-any`
- `preset-19`
  - `deprecated-prop-types-types`
  - `deprecated-legacy-ref`
  - `deprecated-react-child`
  - `deprecated-react-text`
  - `deprecated-void-function-component`
  - `no-implicit-ref-callback-return` (off by default)
  - `react-element-default-any` (off by default)
  - `refobject-defaults`
  - `scoped-jsx`
  - `useRef-required-initial`

### `preset-18`

This codemod combines all codemods for React 18 types.
You can interactively pick the codemods included.
By default, the codemods that are definitely required to upgrade to `@types/react@^18.0.0` are selected.
The other codemods may or may not be required.
You should select all and audit the changed files regardless.

### `context-any` (React 18)

```diff
 class Component extends React.Component<Props> {
+  context: any
   render() {
		 return this.context.someContextProperty;
	 }
 }
```

You should only apply this codemod to files where the type-checker complains about access of `unknown` in `this.context`.
We'll check for any occurence of `context` (case-sensitive) in a `React.Component` body (or `React.PureComponent`).
If we find any occurence of `context` we'll add `context: any` declaration to the class body.

#### false-positive on `context` usage

We'll add `context: any` even if you write `const { context } = props`.
This simplifies the implementation tremendously and follows the overall rationale for false-positives: it can be reverted easily and at worst restores the behavior of React 17 typings.

#### false-negative when inheriting from another component

Class inheritance chains are not handled.

```tsx
class A extends React.Component {}

class B extends A {
	render() {
		// will error since the transform does not add `context: any` to the declaration of `A` nor `B`.
		// It's up to you to decide whether `A` or `B` should have this declaration
		return this.context.value;
	}
}
```

We'll also miss usage of `context` if it's accessed outside of the class body e.g.

```tsx
function getValue(that) {
	return that.context.value;
}

class A extends React.Component {
	render() {
		return getValue(this);
	}
}
```

This doesn't really follow the general transform rationale of "over-applying" since at worst we restore React 17 behavior.
I just think that most class components do not use `this.context` (or already have a type declaration) somewhere else.

### All `deprecated-` transforms

```diff
-React.ReactType
+React.ElementType
-React.SFC
+React.FC
-React.StatelessComponent
+React.FunctionComponent
-React.SFCElement
+React.FunctionComponentElement
```

They simply rename identifiers with a specific name.
If you have a type with the same name from a different package, then the rename results in a false positive.
For example, `ink` also has a `StatelessComponent` but you don't need to rename that type since it's not deprecated.

### `implicit-children` (React 18)

```diff
-React.FunctionComponent<Props>
+React.FunctionComponent<React.PropsWithChildren<Props>>
-React.FunctionComponent
+React.FunctionComponent<React.PropsWithChildren<unknown>>
```

This transform will wrap the props type of `React.FunctionComponent` (and `FC`, `ComponentType`, `SFC` and `StatelessComponent`) with `React.PropsWithChildren`.
Note, that the transform assumes `React.PropsWithChildren` is available.
We can't add that import since `React.PropsWithChildren` can be available via `tsconfig.json`.

#### `implicit-children` false-positive pattern A

We'll apply `React.PropsWithChildren` everytime.
If you have a component that doesn't actually take `children`, we'll not fix what removal of implicit children should've fixed.

Similarly, if your props already have `children` declared, `PropsWithChildren` will be redundant.
Redundant `PropsWithChildren` are only problematic stylistically.

#### `implicit-children` false-positive pattern B

`MyFunctionComponent<Props>` where `MyFunctionComponent` comes from `import { FunctionComponent as MyFunctionComponent } from 'react'` will be ignored.
In other words, the transform will not wrap `Props` in `React.PropsWithChildren`.
The transform would need to implement scope tracking for this pattern to get fixed.

### `useCallback-implicit-any` (React 18)

```diff
-React.useCallback((event) => {})
+React.useCallback((event: any) => {})
```

This transform should only be applied to files where TypeScript errors with "Parameter '\*' implicitly has an 'any' type.(7006)" in `useCallback`.

#### `useCallback-implicit-any` false-positive pattern A

If the callback param is inferrable by TypeScript we might apply `any` without need.
In the example below the type of `event` is inferrable and adding `any` essentially reduces type coverage.
This is why it's recommended to only apply `useCallback-implicit-any` to files that produce "Parameter '\*' implicitly has an 'any' type.(7006)" when type-checking with `@types/react@^18.0.0`.

```diff
type CreateCallback = () => (event: Event) => void;
-const createCallback: CreateCallback = () => useCallback((event) => {}, [])
+const createCallback: CreateCallback = () => useCallback((event: any) => {}, [])
```

### `preset-19`

This codemod combines all codemods for React 19 types.
You can interactively pick the codemods included.
By default, the codemods that are definitely required to upgrade to `@types/react@^19.0.0` are selected.
The other codemods may or may not be required.
You should select all and audit the changed files regardless.

### `deprecated-prop-types-types` (React 19)

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

### `deprecated-legacy-ref` (React 19)

```diff
 import * as React from "react";
 interface Props {
-  ref?: React.LegacyRef;
+  ref?: React.Ref;
 }
```

#### `deprecated-legacy-ref false-negative pattern A

Importing `LegacyRef` via aliased named import will result in the transform being skipped.

```tsx
import { LegacyRef as MyLegacyRef } from "react";
interface Props {
	// not transformed
	ref?: MyLegacyRef;
}
```

### `deprecated-react-child` (React 19)

```diff
 import * as React from "react";
 interface Props {
-  label?: React.ReactChild;
+  label?: React.ReactElement | number | string;
 }
```

#### `deprecated-react-child` false-negative pattern A

Importing `ReactChild` via aliased named import will result in the transform being skipped.

```tsx
import { ReactChild as MyReactChild } from "react";
interface Props {
	// not transformed
	label?: MyReactChild;
}
```

### `deprecated-react-node-array` (React 19)

```diff
 import * as React from "react";
 interface Props {
-  children?: React.ReactNodeArray;
+  children?: ReadonlyArray<React.ReactNode>;
 }
```

#### `deprecated-react-node-array` false-negative pattern A

Importing `ReactNodeArray` via aliased named import will result in the transform being skipped.

```tsx
import { ReactNodeArray as MyReactNodeArray } from "react";
interface Props {
	// not transformed
	children?: MyReactNodeArray;
}
```

### `deprecated-react-fragment` (React 19)

```diff
 import * as React from "react";
 interface Props {
-  children?: React.ReactFragment;
+  children?: Iterable<React.ReactNode>;
 }
```

#### `deprecated-react-fragment` false-negative pattern A

Importing `ReactFragment` via aliased named import will result in the transform being skipped.

```tsx
import { ReactFragment as MyReactFragment } from "react";
interface Props {
	// not transformed
	children?: MyReactFragment;
}
```

### `deprecated-react-text` (React 19)

```diff
 import * as React from "react";
 interface Props {
-  label?: React.ReactText;
+  label?: number | string;
 }
```

#### `deprecated-react-text` false-negative pattern A

Importing `ReactText` via aliased named import will result in the transform being skipped.

```tsx
import { ReactText as MyReactText } from "react";
interface Props {
	// not transformed
	label?: MyReactText;
}
```

### `deprecated-void-function-component` (React 19)

WARNING: Only apply to codebases using `@types/react@^18.0.0`.
In earlier versions of `@types/react` this codemod would change the typings.

```diff
 import * as React from "react";
-const Component: React.VFC = () => {}
+const Component: React.FC = () => {}
-const Component: React.VoidFunctionComponent = () => {}
+const Component: React.FunctionComponent = () => {}
```

### `no-implicit-ref-callback-return` (React 19)

Off by default in `preset-19`. Can be enabled when running `preset-19`.

WARNING: Manually review changes in case you already used ref cleanups in Canary builds.

Ensures you don't accidentally return anything from ref callbacks since the return value was always ignored.
With ref cleanups, this is no longer the case and flagged in types to avoid mistakes.

```diff
-<div ref={current => (instance = current)} />
+<div ref={current => {instance = current}} />
```

This only works for the `ref` prop.
The codemod will not apply to other props that take refs (e.g. `innerRef`).

### `react-element-default-any-props` (React 19)

> [!CAUTION]
> This codemod is only meant as a migration helper for old code.
> The new default for props of `React.ReactElement` is `unknown` but a lot of existing code relied on `any`.
> The codemod should only be used if you have a lot of code relying on the old default.
> Typing out the expected shape of the props is recommended.
> It's also likely that manually fixing is sufficient.
> In [vercel/nextjs we only had to fix one file](https://github.com/eps1lon/next.js/pull/1/commits/97fcba326ef465d134862feb1990f875d360675e) while the codemod would've changed 15 files.

Off by default in `preset-19`. Can be enabled when running `preset-19`.

Defaults the props of a `React.ReactElement` value to `any` if it has the explicit type.

```diff
-declare const element: React.ReactElement
+declare const element: React.ReactElement<any>
```

Does not overwrite existing type parameters.

The codemod does not work when the a value has the `React.ReactElement` type from 3rd party dependencies e.g. in `const: element: React.ReactNode`, the element would still have `unknown` props.

The codemod also does not work on type narrowing e.g.

```tsx
if (React.isValidElement(node)) {
	element.props.foo;
	//            ^^^ Cannot access propertiy 'any' of `unknown`
}
```

The props would need to be cast to `any` (e.g. `(element.props as any).foo`) to preserve the old runtime behavior.

### `refobject-defaults` (React 19)

`RefObject` no longer makes `current` nullable by default

```diff
 import * as React from "react";
-const myRef: React.RefObject<View>
+const myRef: React.RefObject<View | null>
```

#### `refobject-defaults` false-negative pattern A

Importing `RefObject` via aliased named import will result in the transform being skipped.

```tsx
import { RefObject as MyRefObject } from "react";

// not transformed
const myRef: MyRefObject<View>;
```

### `scoped-jsx` (React 19)

Ensures access to global JSX namespace is now scoped to React (see [DefinitelyTyped/DefinitelyTyped#64464](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/64464)).
This codemod tries to match the existing import style but isn't perfect.
If the import style doesn't match your preferences, you should set up auto-fixable lint rules to match this e.g. [`import/order`](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md).

```diff
+import { JSX } from 'react'
-const element: JSX.Element = <div />;
+const element: JSX.Element = <div />;
```

```diff
 import * as React from 'react';
-const element: JSX.Element = <div />;
+const element: React.JSX.Element = <div />;
```

### `useRef-required-initial` (React 19)

`useRef` now always requires an initial value.
Implicit `undefined` is forbidden.

```diff
 import * as React from "react";
-React.useRef()
+React.useRef(undefined)
```

#### `useRef-required-initial` false-negative pattern A

Importing `useRef` via aliased named import will result in the transform being skipped.

```tsx
import { useRef as useReactRef } from "react";

// not transformed
useReactRef<number>();
```

## Supported platforms

The following list contains officially supported runtimes.
Please file an issue for runtimes that are not included in this list.

<!-- #nodejs-suppport Should match CI test matrix -->

- Node.js `16.x || 18.x || 20.x`
