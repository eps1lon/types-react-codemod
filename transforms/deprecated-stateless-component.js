const parseSync = require("./utils/parseSync");

/* eslint-disable no-unreachable */
throw new Error("not implemented");

/**
 * @type {import('jscodeshift').Transform}
 * test:
 */
const transformer = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const changedIdentifiers = [];

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
	return file.source;
};

export default transformer;
