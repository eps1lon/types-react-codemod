---
"types-react-codemod": minor
---

Add codemod to replace deprecated `ReactFragment` by inlining its actual type

```diff
import * as React from 'react';

-const node: React.ReactFragment
+const node: Iterable<React.ReactNode>
```
