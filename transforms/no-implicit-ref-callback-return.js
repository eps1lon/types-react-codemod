const parseSync = require("./utils/parseSync");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
const noImplicitRefCallbackReturnTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	let changedSome = false;

	ast
		.find(j.JSXAttribute, (jsxAttribute) => {
			return jsxAttribute.name.name === "ref";
		})
		.forEach((jsxAttributePath) => {
			const jsxAttribute = jsxAttributePath.node;
			if (
				jsxAttribute.value?.type === "JSXExpressionContainer" &&
				jsxAttribute.value.expression.type === "ArrowFunctionExpression" &&
				jsxAttribute.value.expression.body.type !== "BlockStatement"
			) {
				changedSome = true;

				jsxAttribute.value.expression.body = j.blockStatement([
					j.expressionStatement(jsxAttribute.value.expression.body),
				]);
			}
		});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedSome) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = noImplicitRefCallbackReturnTransform;
