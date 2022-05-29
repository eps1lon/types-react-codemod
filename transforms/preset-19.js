const deprecatedReactChildTransform = require("./deprecated-react-child");
const deprecatedReactTextTransform = require("./deprecated-react-text");
const deprecatedVoidFunctionComponentTransform = require("./deprecated-void-function-component");

/**
 * @type {import('jscodeshift').Transform}
 */
const transform = (file, api, options) => {
	const { preset19Transforms } = options;

	const transformNames = new Set(preset19Transforms.split(","));
	/**
	 * @type {import('jscodeshift').Transform[]}
	 */
	const transforms = [];
	if (transformNames.has("deprecated-react-child")) {
		transforms.push(deprecatedReactChildTransform);
	}
	if (transformNames.has("deprecated-react-text")) {
		transforms.push(deprecatedReactTextTransform);
	}
	if (transformNames.has("deprecated-void-function-component")) {
		transforms.push(deprecatedVoidFunctionComponentTransform);
	}

	let wasAlwaysSkipped = true;
	const newSource = transforms.reduce((currentFileSource, transform) => {
		// TODO: currently we parse -> transform -> print on every transform
		// Instead, we could parse and prince once in the preset and the transformers just deal with an AST.
		// That requires refactoring of every transform into source-transformer and ast-transformer
		const transformResult = transform(
			{ path: file.path, source: currentFileSource },
			api,
			options
		);

		if (transformResult == null) {
			return currentFileSource;
		} else {
			wasAlwaysSkipped = false;
			return transformResult;
		}
	}, file.source);

	if (!wasAlwaysSkipped) {
		return newSource;
	}
};

module.exports = transform;
