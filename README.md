# types-react-codemod

Collection of transforms for [jscodeshift](https://github.com/facebook/jscodeshift) related to `@types/react`.

## Usage

```bash
$ npx types-react-codemod --help
types-react-codemod <codemod> <paths...>

default

Positionals:
  codemod  [string] [required] [choices: "context-any", "deprecated-react-type",
   "deprecated-sfc-element", "deprecated-sfc", "deprecated-stateless-component",
                                "implicit-children", "useCallback-implicit-any"]
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
When considering false-positives vs false-negatives, I opt for false-positives.
The reason being that a false-positive can be reverted easily (assuming you use have the changed code in Version Control e.g. git) while a false-negative requires manual input.

- `deprecated-react-type`
- `deprecated-sfc-element`
- `deprecated-sfc`
- `deprecated-stateless-component`
- `context-any`
- `implicit-children`
- `useCallback-implicit-any`

### `context-any`

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

They simply rename identifiers with a specific name.
If you have a type with the same name from a different package, then the rename results in a false positive.
For example, `ink` also has a `StatelessComponent` but you don't need to rename that type since it's not deprecated.

### `implicit-children`

This transform will wrap the props type of `React.FunctionComponent` (and `FC`, `SFC` and `StatelessComponent`) with `React.PropsWithChildrne`.
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
