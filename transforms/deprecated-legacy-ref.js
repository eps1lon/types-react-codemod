const parseSync = require("./utils/parseSync");
const { renameType } = require("./utils/replaceType");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedLegacyRefTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasChanges = renameType(j, ast, "LegacyRef", "Ref");

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedLegacyRefTransform;
