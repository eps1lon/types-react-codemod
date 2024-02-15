const parseSync = require("./utils/parseSync");
const {
	findTSTypeReferenceCollections,
} = require("./utils/jscodeshift-bugfixes");

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactTextTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let hasChanges = false;

	const reactTextTypeReferences = findTSTypeReferenceCollections(
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

			return identifier !== null && identifier.name === "ReactText";
		},
	);

	for (const typeReferences of reactTextTypeReferences) {
		const changedIdentifiers = typeReferences.replaceWith(() => {
			// `number | string`
			return j.tsUnionType([j.tsNumberKeyword(), j.tsStringKeyword()]);
		});
		if (changedIdentifiers.length > 0) {
			hasChanges = true;
		}
	}

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedReactTextTransform;
