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
$ npx types-react-codemod --help
types-react-codemod <codemod> <paths...>

Positionals:
  codemod [string] [required] [choices: "context-any", "deprecated-react-child",
     "deprecated-react-text", "deprecated-react-type", "deprecated-sfc-element",
        "deprecated-sfc", "deprecated-stateless-component", "implicit-children",
                           "preset-18", "preset-19", "useCallback-implicit-any"]
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
- `deprecated-react-text`

### `preset-18`

This codemod combines all codemods for React 18 types.
You can interactively pick the codemods included.
By default, the codemods that are definitely required to upgrade to `@types/react@^18.0.0` are selected.
The other codemods may or may not be required.
You should select all and audit the changed files regardless.

### `context-any`

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

### `implicit-children`

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

### `useCallback-implicit-any`

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

### `deprecated-react-child`

```diff
 import * as React from "react";
 interface Props {
-  label?: React.ReactChild;
+  label?: React.ReactElement | number | string;
 }
```

#### `deprecated-react-text` false-negative pattern A

Importing `ReactChild` via aliased named import will result in the transform being skipped.

```tsx
import { ReactChild as MyReactChild } from "react";
interface Props {
	// not transformed
	label?: MyReactChild;
}
```

### `deprecated-react-text`

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

### `deprecated-void-function-component`

WARNING: Only apply to codebases using `@types/react@^18.0.0`.
In earlier versions of `@types/react` this codemod would change the typings.

```diff
 import * as React from "react";
-const Component: React.VFC = () => {}
+const Component: React.FC = () => {}
-const Component: React.VoidFunctionComponent = () => {}
+const Component: React.FunctionComponent = () => {}
```

## Supported platforms

The following list contains officially supported runtimes.
Please file an issue for runtimes that are not included in this list.

<!-- #nodejs-suppport Should match CI test matrix -->

- Node.js `14.x || 16.x || 17.x || 18.x || 19.x`
