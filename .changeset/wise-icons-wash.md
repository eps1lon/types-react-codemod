---
"types-react-codemod": patch
---

Fix a bug when replacing types in shorthand array type notations.

For example, replacing `ReactText` in `ReactText[]` should now result in `(number | string)[]` instead of `number | string[]`.
