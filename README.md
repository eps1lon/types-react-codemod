# types-react-codemod

Collection of transforms for jscodeshift related to `@types/react`.

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
- `useCallback-implicit-any`
- `context-any` (not implemented)
- `deprecated-stateless-component`
- `implicit-children` (not implemented)
