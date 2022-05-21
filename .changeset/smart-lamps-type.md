---
"types-react-codemod": minor
---

Avoid transpiling transforms

Previously jscodeshift would transpile the transforms before using them.
This was largely unnecessary and resulted in bugs to to usage of undeclared Babel dependencies.
