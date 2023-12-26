---
"types-react-codemod": minor
---

Add codemod to replace deprecated `ReactNodeArray` by inlining its actual type.

```diff
import * as React from 'react';

-const node: React.ReactNodeArray
+const node: ReadonlyArray<React.ReactNode>
```
