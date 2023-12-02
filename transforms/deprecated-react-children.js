const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactTypeTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const changedIdentifiers = ast
		.find(j.Identifier, (node) => {
			console.log(node);
			return node.name === "ReactChildren";
		})
		.replaceWith(() => {
			return j.typeofTypeAnnotation(j.identifier("ReactChildren"));
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactTypeTransform;
