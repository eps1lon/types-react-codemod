const parseSync = require("./utils/parseSync");
const { replaceReactType } = require("./utils/replaceType");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const deprecatedReactChildTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const hasChanges = replaceReactType(
		j,
		ast,
		"ReactChild",
		(typeReference) => {
			if (typeReference.typeName.type === "TSQualifiedName") {
				return j.tsUnionType([
					// React.ReactElement
					j.tsTypeReference(
						j.tsQualifiedName(
							j.identifier("React"),
							j.identifier("ReactElement"),
						),
					),
					j.tsNumberKeyword(),
					j.tsStringKeyword(),
				]);
			} else {
				return j.tsUnionType([
					// React.ReactElement
					j.tsTypeReference(j.identifier("ReactElement")),
					j.tsNumberKeyword(),
					j.tsStringKeyword(),
				]);
			}
		},
		"ReactElement",
	);

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactChildTransform;
