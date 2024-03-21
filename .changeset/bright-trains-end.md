---
"types-react-codemod": minor
---

Add `react-element-default-any-props` codemod

Opt-in codemod in `preset-19`.

```diff
 // implies `React.ReactElement<unknown>` in React 19 as opposed to `React.ReactElement<any>` in prior versions.
-declare const element: React.ReactElement
+declare const element: React.ReactElement<any>
```

Only meant to migrate old code not a recommendation for how to type React elements.
