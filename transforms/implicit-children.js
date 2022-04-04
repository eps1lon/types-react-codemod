const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/d3b8fc23045213d7ab8568048f99d786/2d1441d25eaed45c6e1d6e2a5ecf6548145c264a
 */
const transformer = (file, api) => {
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
				return [
					"ComponentType",
					"FunctionComponent",
					"FC",
					// include deprecated types to ensure this transform works without `deprecated-*` transforms.
					"SFC",
					"StatelessComponent",
				].includes(identifier.name);
			}
		})
		.forEach((typeReference) => {
			// TODO: Check if `React.PropsWithChildren` or `PropsWithChildren` is available
			const propsWithChildrenTypeName = j.tsQualifiedName(
				j.identifier("React"),
				j.identifier("PropsWithChildren")
			);

			const params = typeReference.get("typeParameters").get("params")
				.value || [j.tsTypeLiteral([])];
			// <React.PropsWithChildren<params[0]>, ...params>
			const paramsWithPropsWithChildren = j.tsTypeParameterInstantiation([
				j.tsTypeReference(
					propsWithChildrenTypeName,
					j.tsTypeParameterInstantiation([params[0]])
				),
				...params.slice(1),
			]);

			// Ideally we'd clone the `typeReference` path and add `typeParameters`.
			// But I don't know if there's an API or better pattern for it.
			typeReference.value.typeParameters = paramsWithPropsWithChildren;
			changedSome = true;
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedSome) {
		return ast.toSource();
	}
	return file.source;
};

export default transformer;
