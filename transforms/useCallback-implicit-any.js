const parseSync = require("./utils/parseSync");

/**
 * @type {import('jscodeshift').Transform}
 *
 * Summary for Klarna's klapp@19fc4dafed84670398644298bf19c8c2a781dcf8/clients
 * 23154 Files unmodified
 * 4790 skipped
 * 99 Ok (6 of which are false-positive but quickly identified)
 */
const useCallbackImplicitAnyTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let changedSome = false;
	ast
		.find(j.CallExpression, (callExpression) => {
			// ignore empty `useCallback()`
			if (callExpression.arguments.length < 1) {
				return false;
			}

			const [maybeCallback] = callExpression.arguments;
			const isCallback = [
				"ArrowFunctionExpression",
				"FunctionExpression",
			].includes(maybeCallback.type);
			if (!isCallback) {
				return false;
			}

			const {
				callee,
				// @ts-expect-error TODO(upstream): should be optional
				typeParameters,
			} = callExpression;

			if (typeParameters != null) {
				// callback params are inferred from useCallback type parameters e.g. useCallback<Callback>(event => {})
				return false;
			}

			if (callee.type === "Identifier") {
				return callee.name === "useCallback";
			} else if (callee.type === "MemberExpression") {
				const { property } = callee;
				if (property.type === "Identifier") {
					return property.name === "useCallback";
				} else if (property.type === "StringLiteral") {
					return property.value === "useCallback";
				}
			}

			return false;
		})
		.forEach((callExpression) => {
			let paramsInferrable = false;
			const parentNode = callExpression.parent.value;
			if (parentNode != null) {
				if (
					parentNode.type === "VariableDeclarator" &&
					parentNode.id.typeAnnotation != null
				) {
					paramsInferrable = true;
				}
			}

			if (paramsInferrable) {
				return;
			}

			callExpression
				.get("arguments")
				.get("0")
				.get("params")
				.each(
					/**
					 *
					 * @param {import('jscodeshift').ASTPath} param
					 */
					(param) => {
						const missingTypeAnnoation =
							param.get("typeAnnotation").value === null;
						if (missingTypeAnnoation) {
							changedSome = true;
							// Ideally we'd clone the `param` path and add a `typeAnnotation`
							// But I don't know if there's an API or better pattern for it.
							// @ts-ignore
							param.value.typeAnnotation = j.tsTypeAnnotation(j.tsAnyKeyword());
						}
					}
				);
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedSome) {
		return ast.toSource();
	}
	return file.source;
};

export default useCallbackImplicitAnyTransform;
