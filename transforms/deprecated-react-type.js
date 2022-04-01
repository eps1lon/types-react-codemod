const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/e961510c31d225c80bac9cb0a499b1b3/65af0f88291c72e1295a5d36e5d372bb5bf50e3c
 */
const transformer = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const changedIdentifiers = ast
		.find(j.Identifier, (node) => {
			return node.name === "ReactType";
		})
		.replaceWith(() => {
			return j.identifier("ElementType");
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
	return file.source;
};

export default transformer;
