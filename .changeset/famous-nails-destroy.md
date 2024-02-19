---
"types-react-codemod": patch
---

Ensure replace and rename codemods have consistent behavior

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
