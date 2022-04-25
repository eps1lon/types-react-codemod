# toMatchInlineSnapshot + --updateSnapshot with source-map@0.8.0-beta

Repro for https://github.com/facebook/jest/issues/6744

```bash
$ yarn
$ yarn test --updateSnapshot
 FAIL  __tests__/deprecated-react-type.js
  ● Test suite failed to run

    Jest: Couldn't locate all inline snapshots.

      at traverseAst (node_modules/jest-snapshot/build/InlineSnapshots.js:304:11)

----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |       0 |        0 |       0 |       0 |
----------|---------|----------|---------|---------|-------------------
Test Suites: 1 failed, 1 total
Tests:       0 total
Snapshots:   0 total
Time:        0.389 s
Ran all test suites.
```
