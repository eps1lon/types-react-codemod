const parseSync = require("./utils/parseSync");
const { replaceReactType } = require("./utils/replaceType");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const deprecatedPropTypesTypes = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const propTypesImportDeclarations = ast.find(j.ImportDeclaration, {
		source: { value: "prop-types" },
	});
	/**
	 * @type {import('jscodeshift').ImportDeclaration}
	 */
	let propTypesImportDeclaration;

	let shouldAddPropTypesImport = false;
	/**
	 * Mapping of imported vs local specifiers e.g.
	 * import { Foo as Bar } from '...' -> map.set('Foo', 'Bar')
	 * @type {Map<string, string>}
	 */
	const propTypesTypesLocalSpecifiers = new Map();
	/**
	 * The identifier with which we can refer to PropTypes e.g. `PropTypes.Validator` or `MyProptypes..Validator`
	 * @type {string | null}
	 */
	let propTypesNamespaceIdentifierValue = null;
	if (propTypesImportDeclarations.length > 0) {
		propTypesImportDeclaration = propTypesImportDeclarations.paths()[0].value;

		for (const specifier of propTypesImportDeclaration.specifiers ?? []) {
			if (
				specifier.type === "ImportDefaultSpecifier" ||
				specifier.type === "ImportNamespaceSpecifier"
			) {
				propTypesNamespaceIdentifierValue =
					// Not clear when they would be nullable and how to handle it.
					/** @type {NonNullable<import('jscodeshift').ImportSpecifier['local']>} */ (
						specifier.local
					).name;
			} else if (specifier.type === "ImportSpecifier") {
				propTypesTypesLocalSpecifiers.set(
					/** @type {NonNullable<import('jscodeshift').ImportSpecifier['imported']>} */ (
						specifier.imported
					).name,
					/** @type {NonNullable<import('jscodeshift').ImportSpecifier['local']>} */ (
						specifier.local
					).name,
				);
			}
		}
	} else {
		propTypesNamespaceIdentifierValue = "PropTypes";
		shouldAddPropTypesImport = true;
		propTypesImportDeclaration = j.importDeclaration(
			[j.importNamespaceSpecifier(j.identifier("PropTypes"))],
			j.stringLiteral("prop-types"),
		);
		propTypesImportDeclaration.importKind = "type";
	}

	let hasChanges;
	for (const movedType of [
		"Validator",
		"Requireable",
		"ValidationMap",
		"WeakValidationMap",
	]) {
		const changedType = replaceReactType(
			j,
			ast,
			movedType,
			(typeReference) => {
				if (propTypesNamespaceIdentifierValue !== null) {
					return j.tsTypeReference(
						j.tsQualifiedName(
							j.identifier(propTypesNamespaceIdentifierValue),
							j.identifier(movedType),
						),
						typeReference.typeParameters,
					);
				} else if (propTypesTypesLocalSpecifiers.has(movedType)) {
					// non-nullable assertion due to above `.has` check.
					const localSpecifier = /** @type {string} */ (
						propTypesTypesLocalSpecifiers.get(movedType)
					);
					return j.tsTypeReference(
						j.identifier(localSpecifier),
						typeReference.typeParameters,
					);
				} else {
					propTypesTypesLocalSpecifiers.set(movedType, movedType);
					const importSpecifier = j.importSpecifier(j.identifier(movedType));
					if (propTypesImportDeclaration.importKind !== "type") {
						// @ts-expect-error -- Missing types in jscodeshift
						importSpecifier.importKind = "type";
					}
					if (propTypesImportDeclaration.specifiers === undefined) {
						propTypesImportDeclaration.specifiers = [importSpecifier];
					} else {
						propTypesImportDeclaration.specifiers.push(importSpecifier);
					}
					return j.tsTypeReference(
						j.identifier(movedType),
						typeReference.typeParameters,
					);
				}
			},
			movedType,
		);

		hasChanges = hasChanges || changedType;
	}

	// Otherwise some files will be marked as "modified" because formatting changed
	if (hasChanges) {
		if (shouldAddPropTypesImport) {
			ast.get().node.program.body.unshift(propTypesImportDeclaration);
		}

		return ast.toSource();
	}
	return file.source;
};

module.exports = deprecatedPropTypesTypes;
