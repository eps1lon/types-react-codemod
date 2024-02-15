---
"types-react-codemod": patch
---

Ensure added imports of types use the `type` modifier

If we'd previously add an import to `ReactNode` (e.g. in `deprecated-react-fragment`),
the codemod would import it as a value.
This breaks TypeScript projects using `verbatimModuleSyntax` as well as projects enforcing `type` imports for types.

Now we ensure new imports of types use the `type` modifier:

```diff
-import { ReactNode } from 'react'
+import { type ReactNode } from 'react'
```

This also changes how we transform the deprecated global JSX namespace.
Instead of rewriting each usage, we opt for adding another import.
The guiding principle being that we keep the changes minimal in a codemod.

Before:

```diff
import * as React from 'react'

-const element: JSX.Element
+const element: React.JSX.Element
```

After:

```diff
import * as React from 'react'
+import { type JSX } from 'react'

const element: JSX.Element
```

Note that rewriting of imports does not change the modifier.
For example, the `deprecated-vfc-codemod` rewrites `VFC` identifiers to `FC`.
If the import of `VFC` had no `type` modifier, the codemod will not add one.

This affects the following codemods:

- `deprecated-react-fragment`
- `deprecated-react-node-array`
- `scoped-jsx`

`type` modifiers for import specifiers require [TypeScript 4.5 which has reached EOL](https://github.com/DefinitelyTyped/DefinitelyTyped#support-window in DefinitelyTyped) which is a strong signal that you should upgrade to at least TypeScript 4.6 by now.
