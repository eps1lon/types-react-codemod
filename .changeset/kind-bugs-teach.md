---
"types-react-codemod": minor
---

Unflag codemods for new refs

Just removing their experimental prefix since we have increased confidence in these changes after seeing their impact internally.

```diff
-experimental-refobject-defaults
+refobject-defaults
```
