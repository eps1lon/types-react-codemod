import contextAnyTransform from "./context-any";
import deprecatedReactTypeTransform from "./deprecated-react-type";
import deprecatedSFCTransform from "./deprecated-sfc";
import deprecatedSFCElementTransform from "./deprecated-sfc-element";
import deprecatedStatelessComponentTransform from "./deprecated-stateless-component";
import implicitChildrenTransform from "./implicit-children";
import implicitAnyTransform from "./useCallback-implicit-any";

/**
 * @type {import('jscodeshift').Transform}
 * test: https://astexplorer.net/#/gist/efb6993a6dda29edfa15087323d95d8b/649afe43341d87843b0e90d737ceefc8f90c321b
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

	console.log(transformNames, transforms);

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

export default transform;
