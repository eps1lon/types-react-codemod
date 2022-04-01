/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/e961510c31d225c80bac9cb0a499b1b3/65af0f88291c72e1295a5d36e5d372bb5bf50e3c
 */
const transformer = (file, api) => {
	const j = api.jscodeshift;
	const ast = j(file.source);

	const changedIdentifiers = ast
		.find(j.Identifier, (node) => {
			return node.name === "ReactType";
		})
		.replaceWith(() => {
			return j.identifier("ElementType");
		});

	// jscodeshift will sometimes change only formatting.
	// we could return nothing if we didn't rename anything.
	// However, returning nothing will mark the file as "skipped" which is not what we want.
	return ast.toSource();
};

export default transformer;
