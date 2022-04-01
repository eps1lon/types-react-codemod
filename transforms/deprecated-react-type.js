/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/e961510c31d225c80bac9cb0a499b1b3/65af0f88291c72e1295a5d36e5d372bb5bf50e3c
 */
const transformer = (file, api) => {
	const j = api.jscodeshift;
	const ast = j(file.source);

	return ast
		.find(j.Identifier, (node) => {
			return node.name === "ReactType";
		})
		.forEach((path) => {
			path.node.name = "ElementType";
		})
		.toSource();
};

export default transformer;
