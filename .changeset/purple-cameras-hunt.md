---
"types-react-codemod": minor
---

Add scoped-jsx transform

This replaces usage of the deprecated global JSX namespace with usage of the scoped namespace:

```diff
+import { JSX } from 'react'

 const element: JSX.Element
```
