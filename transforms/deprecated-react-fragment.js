const parseSync = require("./utils/parseSync");
const { replaceReactType } = require("./utils/replaceType");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const deprecatedReactFragmentTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasChanges = replaceReactType(
		j,
		ast,
		"ReactFragment",
		(typeReference) => {
			if (typeReference.typeName.type === "TSQualifiedName") {
				// `Iterable<*.ReactNode>`
				return j.tsTypeReference(
					j.identifier("Iterable"),
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
				// `Iterable<ReactNode>`
				return j.tsTypeReference(
					j.identifier("Iterable"),
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

module.exports = deprecatedReactFragmentTransform;
