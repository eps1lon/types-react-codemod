const contextAnyTransform = require("./context-any");
const deprecatedReactTypeTransform = require("./deprecated-react-type");
const deprecatedSFCTransform = require("./deprecated-sfc");
const deprecatedSFCElementTransform = require("./deprecated-sfc-element");
const deprecatedStatelessComponentTransform = require("./deprecated-stateless-component");
const implicitChildrenTransform = require("./implicit-children");
const implicitAnyTransform = require("./useCallback-implicit-any");

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
const transform = (file, api, options) => {
	const { preset18Transforms } = options;

	const transformNames = new Set(preset18Transforms.split(","));
	/**
	 * @type {import('jscodeshift').Transform[]}
	 */
	const transforms = [];
	if (transformNames.has("context-any")) {
		transforms.push(contextAnyTransform);
	}
	if (transformNames.has("deprecated-react-type")) {
		transforms.push(deprecatedReactTypeTransform);
	}
	if (transformNames.has("deprecated-sfc")) {
		transforms.push(deprecatedSFCTransform);
	}
	if (transformNames.has("deprecated-sfc-element")) {
		transforms.push(deprecatedSFCElementTransform);
	}
	if (transformNames.has("deprecated-stateless-component")) {
		transforms.push(deprecatedStatelessComponentTransform);
	}
	if (transformNames.has("implicit-children")) {
		transforms.push(implicitChildrenTransform);
	}
	if (transformNames.has("useCallback-implicit-any")) {
		transforms.push(implicitAnyTransform);
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
