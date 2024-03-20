---
"types-react-codemod": minor
---

Add `no-implicit-ref-callback-return` transform

Ensures you don't accidentally return anything from ref callbacks since the return value was always ignored.
With ref cleanups, this is no longer the case and flagged in types to avoid mistakes.

```diff
-<div ref={current => (instance = current)} />
+<div ref={current => {instance = current}} />
```

The transform is opt-in in the `preset-19` in case you already used ref cleanups in Canary releases.
