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

	// Unfortunately, this will mark files without changes as "skipped".
	// However, always returning `ast.toSource()` will change some formatting in rare cases.
	// This is not acceptable because even if it only affects 1% of files you'd end up with 100s of changed files which you need to audit.
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
};

export default transformer;
