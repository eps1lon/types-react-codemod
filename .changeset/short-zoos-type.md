---
"types-react-codemod": patch
---

Find and replace type usage in type parameters of call expressions

Now we properly detect that e.g. `JSX` is used in `someFunctionWithTypeParameters<JSX>()`.

Affected codemods:

- `deprecated-react-child`
- `deprecated-react-fragment`
- `deprecated-react-node-array`
- `deprecated-react-text`
- `scoped-jsx`
