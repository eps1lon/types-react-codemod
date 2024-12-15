const parseSync = require("./utils/parseSync");
const {
	addReactTypeImport,
	findReactImportForNewImports,
} = require("./utils/newReactImports");
const traverse = require("@babel/traverse").default;

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const scopedJsxTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let hasChanges = false;
	let hasGlobalNamespaceReferences = false;

	// ast.get("program").value is sufficient for unit tests but not actually running it on files
	// TODO: How to test?
	const traverseRoot = ast.paths()[0].value;
	traverse(traverseRoot, {
		TSTypeReference({ node: typeReference }) {
			const { typeName } = typeReference;
			if (typeName.type === "TSQualifiedName") {
				if (
					typeName.left.type === "Identifier" &&
					typeName.left.name === "JSX" &&
					typeName.right.type === "Identifier"
				) {
					hasGlobalNamespaceReferences = true;
				}
			}
		},
	});

	if (hasGlobalNamespaceReferences && !jsxImportedFromJsxRuntime(j, ast)) {
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

/**
 * @param {import('jscodeshift').API['jscodeshift']} j
 * @param {import('jscodeshift').Collection} ast
 */
function jsxImportedFromJsxRuntime(j, ast) {
	return (
		ast
			.find(j.ImportSpecifier, {
				imported: { name: "JSX" },
				local: { name: "JSX" },
			})
			.filter((path) => {
				return (
					path.parent &&
					path.parent.node.type === "ImportDeclaration" &&
					(path.parent.node.source.value === "react/jsx-runtime" ||
						path.parent.node.source.value === "react/jsx-dev-runtime")
				);
			}).length > 0
	);
}

module.exports = scopedJsxTransform;
