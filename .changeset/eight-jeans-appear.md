---
"types-react-codemod": minor
---

Add codemod to replace deprecated React types related to propTypes with their counterpart from the `prop-types` package

```diff
+import * as PropTypes from "prop-types";
 import * as React from "react";
-declare const requireable: React.Requireable<React.ReactNode>;
+declare const requireable: PropTypes.Requireable<React.ReactNode>;
-declare const validator: React.Validator<React.ReactNode>;
+declare const requireable: PropTypes.Validator<React.ReactNode>;
-declare const validationMap: React.ValidationMap<{}>;
+declare const requireable: PropTypes.ValidationMap<React.ReactNode>;
-declare const weakValidationMap: React.WeakValidationMap<{}>;
+declare const requireable: PropTypes.WeakValidationMap<React.ReactNode>;
```
