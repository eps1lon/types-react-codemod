const parseSync = require("./utils/parseSync");
const {
	findTSTypeReferenceCollections,
} = require("./utils/jscodeshift-bugfixes");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const reactElementDefaultAnyPropsTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let hasChanges = false;

	const reactElementTypeReferences = findTSTypeReferenceCollections(
		j,
		ast,
		(typeReference) => {
			const { typeName, typeParameters } = typeReference;
			if (typeParameters != null) {
				return false;
			}

			if (typeName.type === "TSQualifiedName") {
				// `React.ReactElement`
				if (
					typeName.left.type === "Identifier" &&
					typeName.left.name === "React" &&
					typeName.right.type === "Identifier" &&
					typeName.right.name === "ReactElement"
				) {
					return true;
				}
			} else {
				// `ReactElement`
				if (typeName.name === "ReactElement") {
					return true;
				}
			}

			return false;
		},
	);

	for (const typeReferences of reactElementTypeReferences) {
		const changedTypes = typeReferences.replaceWith((path) => {
			return j.tsTypeReference(
				path.get("typeName").value,
				j.tsTypeParameterInstantiation([
					j.tsTypeReference(j.identifier("any")),
				]),
			);
		});

		hasChanges = hasChanges || changedTypes.length > 0;
	}

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = reactElementDefaultAnyPropsTransform;
