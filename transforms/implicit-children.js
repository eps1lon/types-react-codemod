const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/d3b8fc23045213d7ab8568048f99d786/e95e6f7022ed017162d4ae593ba033d2f81958d2
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
				.value ?? [
				// The idea is to produce a type that is just `{ children?: ReactNode }`
				// Both `unknown` and `{}` would produce that since `PropsWithChildren` is implemented as `P & { children?: ReactNode }`.
				// However, `{}` is commonly rejected by `@typescript/eslint-plugin`: https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/ban-types.md#default-options
				j.tsUnknownKeyword(),
			];
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
