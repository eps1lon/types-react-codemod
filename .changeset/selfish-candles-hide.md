---
"types-react-codemod": major
---

Fail install if used version of Node.js is not officially supported

Add a list of supported versions of Node.js to `engines` in `package.json`.
If the current version does not match, installation will fail (by default in Yarn and in NPM only if the [`engine-strict` config is enabled](https://docs.npmjs.com/cli/v8/using-npm/config#engine-strict)).

This warning can be ignored either by setting `engine-strict` to `false` in NPM (default) or add `--ignore-engines` to `yarn` (e.g. `yarn --ignore-engines`).
