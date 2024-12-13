const { findTSTypeReferenceCollections } = require("./jscodeshift-bugfixes");

/**
 * Transform that renames a type `sourceIdentifier` to `targetIdentifier`.
 * This function will also rename imports and type references.
 * It returns `true` if any changes were made.
 * @param {import('jscodeshift').API['jscodeshift']} j
 * @param {import('jscodeshift').Collection} ast
 * @param {string} sourceIdentifier
 * @param {string} targetIdentifier
 * @returns {boolean}
 */
function renameType(j, ast, sourceIdentifier, targetIdentifier) {
	return replaceReactType(
		j,
		ast,
		sourceIdentifier,
		(typeReference) => {
			if (typeReference.typeName.type === "TSQualifiedName") {
				// `*.TargetIdentifier<T>`
				return j.tsTypeReference(
					j.tsQualifiedName(
						typeReference.typeName.left,
						j.identifier(targetIdentifier),
					),
					typeReference.typeParameters,
				);
			} else {
				// `TargetIdentifier<T>`
				return j.tsTypeReference(
					j.identifier(targetIdentifier),
					typeReference.typeParameters,
				);
			}
		},
		targetIdentifier,
	);
}

/**
 * Transform that replaces a type reference to `sourceIdentifier` with a type
 * constructed from `buildTargetTypeReference` preserving type parameters.
 * It returns `true` if any changes were made.
 * @param {import('jscodeshift').API['jscodeshift']} j
 * @param {import('jscodeshift').Collection} ast
 * @param {string} sourceIdentifier
 * @param {(sourcePath: import("jscodeshift").TSTypeReference) => import("jscodeshift").TSTypeReference | import("jscodeshift").TSUnionType} buildTargetTypeReference
 * @param {string | null} addedType - `null` if no type was added
 */
function replaceReactType(
	j,
	ast,
	sourceIdentifier,
	buildTargetTypeReference,
	addedType,
) {
	let hasChanges = false;

	const targetIdentifierImports = ast.find(j.ImportSpecifier, (node) => {
		const { imported, local } = node;
		return (
			addedType !== null &&
			imported.type === "Identifier" &&
			imported.name === addedType &&
			// We don't support renames generally, so we don't handle them here
			(local == null || local.name === addedType)
		);
	});
	const sourceIdentifierImports = ast
		.find(j.ImportDeclaration, (declaration) => {
			return declaration.source.value === "react";
		})
		.find(j.ImportSpecifier, (node) => {
			const { imported, local } = node;
			return (
				imported.type === "Identifier" &&
				imported.name === sourceIdentifier &&
				// We don't support renames generally, so we don't handle them here
				(local == null || local.name === sourceIdentifier)
			);
		});
	if (sourceIdentifierImports.length > 0) {
		hasChanges = true;

		if (addedType === null || targetIdentifierImports.length > 0) {
			sourceIdentifierImports.remove();
		} else {
			sourceIdentifierImports.replaceWith((path) => {
				const importSpecifier = j.importSpecifier(j.identifier(addedType));
				if ("importKind" in path.node) {
					// @ts-expect-error -- Missing types in jscodeshift. Babel uses `importKind`: https://astexplorer.net/#/gist/a76bd35f28483a467fef29d3c63aac9b/0e7ba6688fc09bd11b92197349b2384bb4c94574
					importSpecifier.importKind = path.node.importKind;
				}

				return importSpecifier;
			});
		}
	}

	const sourceIdentifierTypeReferences = findTSTypeReferenceCollections(
		j,
		ast,
		(node) => {
			const { typeName } = node;

			return (
				(sourceIdentifierImports.length > 0 &&
					typeName.type === "Identifier" &&
					typeName.name === sourceIdentifier) ||
				(typeName.type === "TSQualifiedName" &&
					typeName.right.type === "Identifier" &&
					typeName.right.name === sourceIdentifier)
			);
		},
	);
	for (const typeReferences of sourceIdentifierTypeReferences) {
		const changedIdentifiers = typeReferences.forEach((path) => {
			const targetNode = buildTargetTypeReference(path.value);
			if (
				targetNode.type === "TSUnionType" &&
				path.parentPath.value.type === "TSArrayType"
			) {
				path.replace(j.tsParenthesizedType(targetNode));
			} else {
				path.replace(targetNode);
			}
		});
		if (changedIdentifiers.length > 0) {
			hasChanges = true;
		}
	}

	return hasChanges;
}

module.exports = { replaceReactType, renameType };
