const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/ebd4c5257e3b5385a860de26edab25a0/a9df97df215041311c96c309683bdb9cad5b7b01
 */
const deprecatedStatelessComponentTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const changedIdentifiers = ast
		.find(j.Identifier, (node) => {
			return node.name === "StatelessComponent";
		})
		.replaceWith(() => {
			return j.identifier("FunctionComponent");
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}
	return file.source;
};

export default deprecatedStatelessComponentTransform;
