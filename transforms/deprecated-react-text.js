const parseSync = require("./utils/parseSync");
const { replaceReactType } = require("./utils/replaceType");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactTextTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasChanges = replaceReactType(
		j,
		ast,
		"ReactText",
		() => {
			// `number | string`
			return j.tsUnionType([j.tsNumberKeyword(), j.tsStringKeyword()]);
		},
		null,
	);

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactTextTransform;
