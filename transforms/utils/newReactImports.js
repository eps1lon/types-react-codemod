/**
 * @param {import('jscodeshift').API['jscodeshift']} j
 * @param {import('jscodeshift').Collection} ast
 * @returns {import('jscodeshift').Collection<import('jscodeshift').ImportDeclaration>}
 */
function findReactImportForNewImports(j, ast) {
	return ast
		.find(j.ImportDeclaration, {
			source: { value: "react" },
		})
		.filter((path) => {
			const importDeclaration = path.node;
			// Filter out
			// - `import * as React from 'react';`
			// - `import type * as React from 'react';`
			// - `import type React from 'react';`
			// All other patterns can take a named import
			if (importDeclaration.specifiers?.length === 1) {
				const specifier = importDeclaration.specifiers[0];
				const isDefaultTypeImport =
					specifier.type === "ImportDefaultSpecifier" &&
					importDeclaration.importKind === "type";

				return (
					!isDefaultTypeImport && specifier.type !== "ImportNamespaceSpecifier"
				);
			}
			return true;
		});
}

/**
 * @param {import('jscodeshift').API['jscodeshift']} j
 * @param {import('jscodeshift').Collection<import('jscodeshift').ImportDeclaration>} reactImport
 */
function addReactTypeImport(j, reactImport) {
	const importSpecifier = j.importSpecifier(j.identifier("JSX"));

	if (reactImport.get("importKind").value !== "type") {
		// @ts-expect-error -- Missing types in jscodeshift. Babel uses `importKind`: https://astexplorer.net/#/gist/a76bd35f28483a467fef29d3c63aac9b/0e7ba6688fc09bd11b92197349b2384bb4c94574
		importSpecifier.importKind = "type";
	}

	reactImport.get("specifiers").value.push(importSpecifier);
}

module.exports = { addReactTypeImport, findReactImportForNewImports };
