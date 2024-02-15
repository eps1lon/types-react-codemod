const parseSync = require("./utils/parseSync");
const {
	findTSTypeReferenceCollections,
} = require("./utils/jscodeshift-bugfixes");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactChildTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const reactChildTypeReferences = findTSTypeReferenceCollections(
		j,
		ast,
		(node) => {
			const { typeName } = node;
			/**
			 * @type {import('jscodeshift').Identifier | null}
			 */
			let identifier = null;
			if (typeName.type === "Identifier") {
				identifier = typeName;
			} else if (
				typeName.type === "TSQualifiedName" &&
				typeName.right.type === "Identifier"
			) {
				identifier = typeName.right;
			}

			return identifier !== null && identifier.name === "ReactChild";
		},
	);

	let didChangeIdentifiers = false;
	for (const typeReferences of reactChildTypeReferences) {
		const changedIdentifiers = typeReferences.replaceWith(() => {
			// `React.ReactElement | number | string`
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
		});
		if (changedIdentifiers.length > 0) {
			didChangeIdentifiers = true;
		}
	}

	// Otherwise some files will be marked as "modified" because formatting changed
	if (didChangeIdentifiers) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactChildTransform;
