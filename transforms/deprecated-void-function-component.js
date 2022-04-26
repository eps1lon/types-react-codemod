const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedVoidFunctionComponentTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const changedIdentifiers = ast
		.find(j.Identifier, (node) => {
			return node.name === "VFC" || node.name === "VoidFunctionComponent";
		})
		.replaceWith((path) => {
			return j.identifier(path.node.name === "VFC" ? "FC" : "FunctionComponent");
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
	return file.source;
};

export default deprecatedVoidFunctionComponentTransform;
