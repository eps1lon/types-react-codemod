const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedSFCTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const changedIdentifiers = ast
		.find(j.Identifier, (node) => {
			return node.name === "SFC";
		})
		.replaceWith(() => {
			return j.identifier("FC");
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
	return file.source;
};

export default deprecatedSFCTransform;
