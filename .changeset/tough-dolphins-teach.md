---
"types-react-codemod": patch
---

Parse .ts files without JSX plugin.

Otherwise code such as

```ts
(<RegExp>expected).test(object);
```

-- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3eacc5e0b7c56d2670a5a0e68735f7638e8f38f3/types/chai-like/chai-like-tests.ts#L15

could not be parsed.
