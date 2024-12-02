const parseSync = require("./utils/parseSync");
const { renameType } = require("./utils/replaceType");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const deprecatedStatelessComponentTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasChanges = renameType(
		j,
		ast,
		"StatelessComponent",
		"FunctionComponent",
	);

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedStatelessComponentTransform;
