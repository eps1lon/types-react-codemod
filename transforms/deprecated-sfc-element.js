const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/e63cf2776df94790a14280da12128019/3e82bd47dc3df1bb555c595e6b4423855d3f3277
 */
const deprecatedSFCElementTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const changedIdentifiers = ast
		.find(j.Identifier, (node) => {
			return node.name === "SFCElement";
		})
		.replaceWith(() => {
			return j.identifier("FunctionComponentElement");
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
	return file.source;
};

export default deprecatedSFCElementTransform;
