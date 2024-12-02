const parseSync = require("./utils/parseSync");
const { renameType } = require("./utils/replaceType");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const deprecatedReactTypeTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasChanges = renameType(j, ast, "ReactType", "ElementType");

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactTypeTransform;
