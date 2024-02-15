const parseSync = require("./utils/parseSync");
const {
	addReactTypeImport,
	findReactImportForNewImports,
} = require("./utils/newReactImports");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactChildTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

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
	if (globalNamespaceReferences.length > 0) {
		const reactImport = findReactImportForNewImports(j, ast);
		const jsxImportSpecifier = reactImport.find(j.ImportSpecifier, {
			imported: { name: "JSX" },
		});

		if (jsxImportSpecifier.length === 0) {
			hasChanges = true;

			const hasExistingReactImport = reactImport.length > 0;
			if (hasExistingReactImport) {
				addReactTypeImport(j, reactImport);
			} else {
				const importSpecifier = j.importSpecifier(j.identifier("JSX"));
				const jsxNamespaceImport = j.importDeclaration(
					[importSpecifier],
					j.stringLiteral("react"),
					// Not using inline type import because it violates https://typescript-eslint.io/rules/no-import-type-side-effects/
					"type",
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
