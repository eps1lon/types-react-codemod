const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 *
 * Summary for Klarna's klapp TODO
 */
const refObjectDefaultsTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let changedSome = false;

	ast
		.find(j.TSTypeReference, (typeReference) => {
			const { typeName } = typeReference;
			if (typeName.type === "TSTypeParameter") {
				// TODO: What code produces this AST?
				return false;
			} else {
				const identifier =
					typeName.type === "TSQualifiedName"
						? /** @type {any} */ (typeName.right)
						: typeName;
				return ["RefObject"].includes(identifier.name);
			}
		})
		.forEach((typeReference) => {
			/**
			 * @type {import('ast-types').namedTypes.TSTypeParameterInstantiation['params'] | undefined}
			 */
			const params = typeReference.get("typeParameters").get("params").value;
			if (params !== undefined) {
				const [typeNode] = params;

				/**
				 * @type {typeof typeNode | undefined}
				 */
				let nullableType;
				if (typeNode.type === "TSUnionType") {
					const typeIsApparentAny = typeNode.types.some((unionMember) => {
						return unionMember.type === "TSAnyKeyword";
					});
					if (!typeIsApparentAny) {
						const unionIsApparentlyNullable = typeNode.types.some(
							(unionMember) => {
								return unionMember.type === "TSNullKeyword";
							}
						);

						nullableType = unionIsApparentlyNullable
							? typeNode
							: j.tsUnionType([...typeNode.types, j.tsNullKeyword()]);
					}
				} else {
					if (typeNode.type !== "TSAnyKeyword") {
						nullableType = j.tsUnionType([typeNode, j.tsNullKeyword()]);
					}
				}

				if (nullableType !== undefined && nullableType !== typeNode) {
					// Ideally we'd clone the `typeReference` path and add `typeParameters`.
					// But I don't know if there's an API or better pattern for it.
					typeReference.value.typeParameters = j.tsTypeParameterInstantiation([
						nullableType,
					]);
					changedSome = true;
				}
			}
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedSome) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = refObjectDefaultsTransform;
