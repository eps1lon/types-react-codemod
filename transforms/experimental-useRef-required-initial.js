const parseSync = require("./utils/parseSync");
const t = require("@babel/types");
const traverse = require("@babel/traverse").default;

/**
 * @type {import('jscodeshift').Transform}
 *
 * Summary for Klarna's klapp@?
 * TODO
 */
const useRefRequiredInitialTransform = (file) => {
	const ast = parseSync(file);

	let changedSome = false;

	// ast.get("program").value is sufficient for unit tests but not actually running it on files
	// TODO: How to test?
	const traverseRoot = ast.paths()[0].value;
	traverse(traverseRoot, {
		CallExpression({ node: callExpression }) {
			const isUseRefCall =
				(callExpression.callee.type === "Identifier" &&
					callExpression.callee.name === "useRef") ||
				(callExpression.callee.type === "MemberExpression" &&
					callExpression.callee.property.type === "Identifier" &&
					callExpression.callee.property.name === "useRef");

			if (isUseRefCall && callExpression.arguments.length === 0) {
				changedSome = true;
				callExpression.arguments = [t.identifier("undefined")];
			}
		},
	});

	// Otherwise some files will be marked as "modified" because formatting changed
	if (changedSome) {
		return ast.toSource();
	}
	return file.source;
};

module.exports = useRefRequiredInitialTransform;
