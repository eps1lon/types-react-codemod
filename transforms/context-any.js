const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 *
 * Summary for Klarna's klapp@19fc4dafed84670398644298bf19c8c2a781dcf8/clients
 * 28172 Files unmodified
 * 11 skipped
 * 5 Ok
 * 1 false-positive due to `this.props.context` access
 * 2 false-positive due to `path['context']` access
 * 1 false-positive due to `constructor(props, context)`
 */
const contextAnyTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let changedSome = false;

	ast
		.find(j.ClassDeclaration, (classDeclaration) => {
			const { superClass } = classDeclaration;
			if (superClass == null) {
				return false;
			}

			/**
			 * @type {string}
			 */
			let identifierName;
			switch (superClass.type) {
				case "Identifier":
					identifierName = superClass.name;
					break;
				case "MemberExpression":
					identifierName = /** @type {any} */ (superClass.property).name;
					break;
				default:
					return false;
			}

			return ["Component", "PureComponent"].includes(identifierName);
		})
		.forEach((classDeclaration) => {
			/**
			 * Not sure why `tokens` don't exist in the type-defs.
			 * The implementation of `readsContext` was tested in astexplorer.com but is rejected by TS.
			 * @type {any}
			 */
			const classDeclarationLoc = classDeclaration.node.loc;
			if (classDeclarationLoc == null) {
				// unable to check for `this.context` usage
				return;
			}

			/**
			 * @type {Array<{ value: string }>}
			 */
			const classBodyTokens = classDeclarationLoc.tokens.slice(
				classDeclarationLoc.start.token,
				classDeclarationLoc.end.token
			);
			const readsContext = classBodyTokens.some((token) => {
				return token.value === "context";
			});

			if (readsContext) {
				const classBody = classDeclaration.get("body").get("body").value;
				const hasTypedContext = classBody.some(
					/**
					 * @param {any} node
					 */
					(node) => {
						const isClassProperty = node.type === "ClassProperty";
						if (isClassProperty) {
							return (
								node.key.type === "Identifier" &&
								node.key.name === "context" &&
								node.typeAnnotation != null
							);
						}

						return false;
					}
				);

				if (!hasTypedContext) {
					// Ideally we'd clone the `body` path and add `context: any` class property.
					// But I don't know if there's an API or better pattern for it.
					classDeclaration.value.body = j.classBody([
						// context: any;
						j.classProperty(
							j.identifier("context"),
							null,
							j.tsTypeAnnotation(j.tsAnyKeyword())
						),
						...classBody,
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

export default contextAnyTransform;
