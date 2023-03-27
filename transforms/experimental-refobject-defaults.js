const parseSync = require("./utils/parseSync");
const t = require("@babel/types");
const traverse = require("@babel/traverse").default;

/**
 * @type {import('jscodeshift').Transform}
 *
 * Summary for Klarna's klapp TODO
 */
const refObjectDefaultsTransform = (file) => {
	const ast = parseSync(file);

	let changedSome = false;

	// ast.get("program").value is sufficient for unit tests but not actually running it on files
	// TODO: How to test?
	const traverseRoot = ast.paths()[0].value;
	/**
	 * @type {import('@babel/types').TSTypeReference[]}
	 */
	const refObjectTypeReferences = [];
	traverse(traverseRoot, {
		TSTypeReference({ node: typeReference }) {
			const { typeName } = typeReference;
			const identifier =
				typeName.type === "TSQualifiedName" ? typeName.right : typeName;

			if (["RefObject"].includes(identifier.name)) {
				refObjectTypeReferences.push(typeReference);
			}
		},
	});

	refObjectTypeReferences.forEach((typeReference) => {
		const params = typeReference.typeParameters?.params;
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
						: t.tsUnionType([...typeNode.types, t.tsNullKeyword()]);
				}
			} else {
				if (typeNode.type !== "TSAnyKeyword") {
					nullableType = t.tsUnionType([typeNode, t.tsNullKeyword()]);
				}
			}

			if (nullableType !== undefined && nullableType !== typeNode) {
				// Ideally we'd clone the `typeReference` path and add `typeParameters`.
				// But I don't know if there's an API or better pattern for it.
				typeReference.typeParameters = t.tsTypeParameterInstantiation([
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
