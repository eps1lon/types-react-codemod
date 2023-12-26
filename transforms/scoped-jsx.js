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
				),
				typeReference.value.typeParameters
			);
		});
	} else if (globalNamespaceReferences.length > 0) {
		const reactImport = ast.find(j.ImportDeclaration, {
			source: { value: "react" },
		});
		const jsxImportSpecifier = reactImport.find(j.ImportSpecifier, {
			imported: { name: "JSX" },
		});

		if (jsxImportSpecifier.length === 0) {
			hasChanges = true;

			const hasExistingReactImport = reactImport.length > 0;
			if (hasExistingReactImport) {
				reactImport
					.get("specifiers")
					.value.push(j.importSpecifier(j.identifier("JSX")));
			} else {
				const jsxNamespaceImport = j.importDeclaration(
					[j.importSpecifier(j.identifier("JSX"))],
					j.stringLiteral("react")
				);

				const lastImport = ast.find(j.ImportDeclaration).at(-1);

				if (lastImport.length > 0) {
					lastImport.insertAfter(jsxNamespaceImport);
				} else {
					// TODO: Intuitively I wanted to do `ast.insertBefore` but that crashes
					ast.get("program").get("body").value.unshift(jsxNamespaceImport);
				}
			}
		}
	}

	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactChildTransform;
