/**
 * This function returns all TSTypeReference collections in the AST.
 *
 * ast.find(TSTypeReference) does not find type references in type parameters of call expression.
 * @param {import('jscodeshift').API['jscodeshift']} j
 * @param {import('jscodeshift').Collection} ast
 * @param {(path: import('jscodeshift').TSTypeReference) => boolean} filter
 */
function findTSTypeReferenceCollections(j, ast, filter) {
	return [
		ast.find(j.TSTypeReference, filter),
		ast
			.find(j.CallExpression, (node) => {
				// @ts-expect-error ast-types does not know about typeParameters which is probably why it doesn't visit them.
				return node.typeParameters !== undefined;
			})
			.map((path) => {
				return path.get("typeParameters");
			})
			.find(j.TSTypeReference, filter),
	];
}

module.exports = { findTSTypeReferenceCollections };
