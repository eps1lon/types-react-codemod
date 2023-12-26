const deprecatedReactChildTransform = require("./deprecated-react-child");
const deprecatedReactNodeArrayTransform = require("./deprecated-react-node-array");
const deprecatedReactFragmentTransform = require("./deprecated-react-fragment");
const deprecatedReactTextTransform = require("./deprecated-react-text");
const deprecatedVoidFunctionComponentTransform = require("./deprecated-void-function-component");
const refobjectDefaultsTransform = require("./refobject-defaults");
const scopedJsxTransform = require("./scoped-jsx");
const useRefRequiredInitialTransform = require("./useRef-required-initial");

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
	if (transformNames.has("deprecated-react-node-array")) {
		transforms.push(deprecatedReactNodeArrayTransform);
	}
	if (transformNames.has("deprecated-react-fragment")) {
		transforms.push(deprecatedReactFragmentTransform);
	}
	if (transformNames.has("deprecated-react-text")) {
		transforms.push(deprecatedReactTextTransform);
	}
	if (transformNames.has("deprecated-void-function-component")) {
		transforms.push(deprecatedVoidFunctionComponentTransform);
	}
	if (transformNames.has("refobject-defaults")) {
		transforms.push(refobjectDefaultsTransform);
	}
	if (transformNames.has("scoped-jsx")) {
		transforms.push(scopedJsxTransform);
	}
	if (transformNames.has("useRef-required-initial")) {
		transforms.push(useRefRequiredInitialTransform);
	}

	let wasAlwaysSkipped = true;
	const newSource = transforms.reduce((currentFileSource, transform) => {
		// TODO: currently we parse -> transform -> print on every transform
		// Instead, we could parse and prince once in the preset and the transformers just deal with an AST.
		// That requires refactoring of every transform into source-transformer and ast-transformer
		const transformResult = transform(
			{ path: file.path, source: currentFileSource },
			api,
			options,
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
