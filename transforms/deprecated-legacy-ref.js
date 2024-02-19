const parseSync = require("./utils/parseSync");
const {
	findTSTypeReferenceCollections,
} = require("./utils/jscodeshift-bugfixes");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedLegacyRefTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let hasChanges = false;

	const targetIdentifierImports = ast.find(j.ImportSpecifier, (node) => {
		const { imported, local } = node;
		return (
			imported.type === "Identifier" &&
			imported.name === "Ref" &&
			// We don't support renames generally, so we don't handle them here
			(local == null || local.name === "Ref")
		);
	});
	const sourceIdentifierImports = ast.find(j.ImportSpecifier, (node) => {
		const { imported, local } = node;
		return (
			imported.type === "Identifier" &&
			imported.name === "LegacyRef" &&
			// We don't support renames generally, so we don't handle them here
			(local == null || local.name === "LegacyRef")
		);
	});
	if (targetIdentifierImports.length > 0) {
		hasChanges = true;
		sourceIdentifierImports.remove();
	} else if (sourceIdentifierImports.length > 0) {
		hasChanges = true;
		sourceIdentifierImports.replaceWith((path) => {
			const importSpecifier = j.importSpecifier(j.identifier("Ref"));
			if ("importKind" in path.node) {
				// @ts-expect-error -- Missing types in jscodeshift. Babel uses `importKind`: https://astexplorer.net/#/gist/a76bd35f28483a467fef29d3c63aac9b/0e7ba6688fc09bd11b92197349b2384bb4c94574
				importSpecifier.importKind = path.node.importKind;
			}

			return importSpecifier;
		});
	}

	const sourceIdentifierTypeReferences = findTSTypeReferenceCollections(
		j,
		ast,
		(node) => {
			const { typeName } = node;

			return typeName.type === "Identifier" && typeName.name === "LegacyRef";
		},
	);
	for (const typeReferences of sourceIdentifierTypeReferences) {
		const changedIdentifiers = typeReferences.replaceWith((path) => {
			// `Ref<T>`
			return j.tsTypeReference(
				j.identifier("Ref"),
				path.get("typeParameters").value,
			);
		});
		if (changedIdentifiers.length > 0) {
			hasChanges = true;
		}
	}

	const sourceIdentifierQualifiedNamesReferences =
		findTSTypeReferenceCollections(j, ast, (node) => {
			const { typeName } = node;

			return (
				typeName.type === "TSQualifiedName" &&
				typeName.right.type === "Identifier" &&
				typeName.right.name === "LegacyRef"
			);
		});
	for (const typeReferences of sourceIdentifierQualifiedNamesReferences) {
		const changedQualifiedNames = typeReferences.replaceWith((path) => {
			const { node } = path;
			const typeName = /** @type {import('jscodeshift').TSQualifiedName} */ (
				node.typeName
			);
			// `*.Ref<T>`
			return j.tsTypeReference(
				j.tsQualifiedName(typeName.left, j.identifier("Ref")),
				path.get("typeParameters").value,
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

module.exports = deprecatedLegacyRefTransform;
