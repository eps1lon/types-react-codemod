const parseSync = require("./utils/parseSync");
const {
	findTSTypeReferenceCollections,
} = require("./utils/jscodeshift-bugfixes");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactNodeArrayTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let hasChanges = false;

	const hasReactNodeImport = ast.find(j.ImportSpecifier, (node) => {
		const { imported, local } = node;
		return (
			imported.type === "Identifier" &&
			imported.name === "ReactNode" &&
			// We don't support renames generally, so we don't handle them here
			(local == null || local.name === "ReactNode")
		);
	});
	const reactNodeArrayImports = ast.find(j.ImportSpecifier, (node) => {
		const { imported, local } = node;
		return (
			imported.type === "Identifier" &&
			imported.name === "ReactNodeArray" &&
			// We don't support renames generally, so we don't handle them here
			(local == null || local.name === "ReactNodeArray")
		);
	});
	if (reactNodeArrayImports.length > 0) {
		hasChanges = true;
	}

	if (hasReactNodeImport.length > 0) {
		reactNodeArrayImports.remove();
	} else {
		reactNodeArrayImports.replaceWith((path) => {
			const importSpecifier = j.importSpecifier(j.identifier("ReactNode"));

			const importDeclaration = path.parentPath.parentPath.value;
			if (importDeclaration.importKind !== "type") {
				// @ts-expect-error -- Missing types in jscodeshift. Babel uses `importKind`: https://astexplorer.net/#/gist/a76bd35f28483a467fef29d3c63aac9b/0e7ba6688fc09bd11b92197349b2384bb4c94574
				importSpecifier.importKind = "type";
			}

			return importSpecifier;
		});
	}

	const reactNodeArrayTypeReferences = findTSTypeReferenceCollections(
		j,
		ast,
		(node) => {
			const { typeName } = node;

			return (
				typeName.type === "Identifier" && typeName.name === "ReactNodeArray"
			);
		},
	);
	for (const typeReferences of reactNodeArrayTypeReferences) {
		const changedIdentifiers = typeReferences.replaceWith(() => {
			// `ReadonlyArray<ReactNode>`
			return j.tsTypeReference(
				j.identifier("ReadonlyArray"),
				j.tsTypeParameterInstantiation([
					j.tsTypeReference(j.identifier("ReactNode")),
				]),
			);
		});

		if (changedIdentifiers.length > 0) {
			hasChanges = true;
		}
	}

	const reactNodeArrayQualifiedTypeReferences = findTSTypeReferenceCollections(
		j,
		ast,
		(node) => {
			const { typeName } = node;

			return (
				typeName.type === "TSQualifiedName" &&
				typeName.right.type === "Identifier" &&
				typeName.right.name === "ReactNodeArray"
			);
		},
	);
	for (const typeReferences of reactNodeArrayQualifiedTypeReferences) {
		const changedQualifiedNames = typeReferences.replaceWith((path) => {
			const { node } = path;
			const typeName = /** @type {import('jscodeshift').TSQualifiedName} */ (
				node.typeName
			);
			// `ReadonlyArray<*.ReactNode>`
			return j.tsTypeReference(
				j.identifier("ReadonlyArray"),
				j.tsTypeParameterInstantiation([
					j.tsTypeReference(
						j.tsQualifiedName(typeName.left, j.identifier("ReactNode")),
					),
				]),
			);
		});

		if (changedQualifiedNames.length > 0) {
			hasChanges = true;
		}
	}

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactNodeArrayTransform;
