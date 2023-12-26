const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactFragmentTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasReactNodeImport = ast.find(j.ImportSpecifier, (node) => {
		const { imported, local } = node;
		return (
			imported.type === "Identifier" &&
			imported.name === "ReactNode" &&
			// We don't support renames generally, so we don't handle them here
			(local == null || local.name === "ReactNode")
		);
	});
	const reactFragmentImports = ast.find(j.ImportSpecifier, (node) => {
		const { imported, local } = node;
		return (
			imported.type === "Identifier" &&
			imported.name === "ReactFragment" &&
			// We don't support renames generally, so we don't handle them here
			(local == null || local.name === "ReactFragment")
		);
	});

	if (hasReactNodeImport.length > 0) {
		reactFragmentImports.remove();
	} else {
		reactFragmentImports.replaceWith(() => {
			return j.importSpecifier(j.identifier("ReactNode"));
		});
	}

	const changedIdentifiers = ast
		.find(j.TSTypeReference, (node) => {
			const { typeName } = node;

			return (
				typeName.type === "Identifier" && typeName.name === "ReactFragment"
			);
		})
		.replaceWith(() => {
			// `Iterable<ReactNode>`
			return j.tsTypeReference(
				j.identifier("Iterable"),
				j.tsTypeParameterInstantiation([
					j.tsTypeReference(j.identifier("ReactNode")),
				]),
			);
		});

	const changedQualifiedNames = ast
		.find(j.TSTypeReference, (node) => {
			const { typeName } = node;

			return (
				typeName.type === "TSQualifiedName" &&
				typeName.right.type === "Identifier" &&
				typeName.right.name === "ReactFragment"
			);
		})
		.replaceWith((path) => {
			const { node } = path;
			const typeName = /** @type {import('jscodeshift').TSQualifiedName} */ (
				node.typeName
			);
			// `Iterable<*.ReactNode>`
			return j.tsTypeReference(
				j.identifier("Iterable"),
				j.tsTypeParameterInstantiation([
					j.tsTypeReference(
						j.tsQualifiedName(typeName.left, j.identifier("ReactNode")),
					),
				]),
			);
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (
		changedIdentifiers.length > 0 ||
		changedQualifiedNames.length > 0 ||
		reactFragmentImports.length > 0
	) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactFragmentTransform;
