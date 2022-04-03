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
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  --dry                                               [boolean] [default: false]
  --verbose                                           [boolean] [default: false]
```

## Available transforms

- `deprecated-react-type`
- `deprecated-sfc-element`
- `deprecated-sfc`
- `deprecated-stateless-component`
- `useCallback-implicit-any`
- `context-any` (not implemented)
- `implicit-children` (not implemented)

## False-Positives

Some transforms change code they shouldn't actually change.
Fixing all of these requires a lot of implementation effort.
When considering false-positives vs false-negatives, I opt for false-positives.
The reason being that a false-positive can be reverted easily (assuming you use have the changed code in Version Control e.g. git) while a false-negative requires manual input.

### All `deprecated-` transforms

They simply rename identifiers with a specific name.
If you have a type with the same name from a different package, then the rename results in a false positive.
For example, `ink` also has a `StatelessComponent` but you don't need to rename that type since it's not deprecated.
