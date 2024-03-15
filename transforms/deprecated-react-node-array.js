const parseSync = require("./utils/parseSync");
const { replaceReactType } = require("./utils/replaceType");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactNodeArrayTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasChanges = replaceReactType(
		j,
		ast,
		"ReactNodeArray",
		(typeReference) => {
			if (typeReference.typeName.type === "TSQualifiedName") {
				// `ReadonlyArray<*.ReactNode>`
				return j.tsTypeReference(
					j.identifier("ReadonlyArray"),
					j.tsTypeParameterInstantiation([
						j.tsTypeReference(
							j.tsQualifiedName(
								typeReference.typeName.left,
								j.identifier("ReactNode"),
							),
						),
					]),
				);
			} else {
				// `ReadonlyArray<ReactNode>`
				return j.tsTypeReference(
					j.identifier("ReadonlyArray"),
					j.tsTypeParameterInstantiation([
						j.tsTypeReference(j.identifier("ReactNode")),
					]),
				);
			}
		},
		"ReactNode",
	);

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactNodeArrayTransform;
