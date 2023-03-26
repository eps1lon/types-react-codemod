const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactChildTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	/**
	 * @type {string | null}
	 */
	let reactNamespaceName = null;
	ast.find(j.ImportDeclaration).forEach((importDeclaration) => {
		const node = importDeclaration.value;
		if (
			node.importKind === "value" &&
			node.source.value === "react" &&
			node.specifiers?.[0]?.type === "ImportNamespaceSpecifier"
		) {
			reactNamespaceName = node.specifiers[0].local?.name ?? null;
		}
	});

	const globalNamespaceReferences = ast.find(j.TSTypeReference, (node) => {
		const { typeName } = node;

		if (typeName.type === "TSQualifiedName") {
			return (
				typeName.left.type === "Identifier" &&
				typeName.left.name === "JSX" &&
				typeName.right.type === "Identifier"
			);
		}
		return false;
	});

	let hasChanges = false;
	if (reactNamespaceName !== null && globalNamespaceReferences.length > 0) {
		hasChanges = true;

		globalNamespaceReferences.replaceWith((typeReference) => {
			const namespaceMember = typeReference
				.get("typeName")
				.get("right")
				.get("name").value;

			return j.tsTypeReference(
				j.tsQualifiedName(
					j.tsQualifiedName(
						j.identifier(/** @type {string} */ (reactNamespaceName)),
						j.identifier("JSX")
					),
					j.identifier(namespaceMember)
				)
			);
		});
	} else if (globalNamespaceReferences.length > 0) {
		hasChanges = true;

		const jsxNamespaceImport = j.importDeclaration(
			[j.importSpecifier(j.identifier("JSX"))],
			j.stringLiteral("react")
		);

		const imports = ast.find(j.ImportDeclaration);

		if (imports.length > 0) {
			imports.insertAfter(jsxNamespaceImport);
		} else {
			// TODO: Intuitively I wanted to do `ast.insertBefore` but that crashes
			ast.get("program").get("body").value.unshift(jsxNamespaceImport);
		}
	}

	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactChildTransform;
