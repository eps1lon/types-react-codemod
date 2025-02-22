const deprecatedPropTypesTypes = require("./deprecated-prop-types-types");
const deprecatedLegacyRefTransform = require("./deprecated-legacy-ref");
const deprecatedReactChildTransform = require("./deprecated-react-child");
const deprecatedReactNodeArrayTransform = require("./deprecated-react-node-array");
const deprecatedReactFragmentTransform = require("./deprecated-react-fragment");
const deprecatedReactTextTransform = require("./deprecated-react-text");
const deprecatedVoidFunctionComponentTransform = require("./deprecated-void-function-component");
const noImplicitRefCallbackReturnTransform = require("./no-implicit-ref-callback-return");
const reactElementDefaultAnyPropsTransform = require("./react-element-default-any-props");
const refobjectDefaultsTransform = require("./refobject-defaults");
const scopedJsxTransform = require("./scoped-jsx");
const useRefRequiredInitialTransform = require("./useRef-required-initial");

/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 * @param {import('jscodeshift').Options} options
 */
const transform = (file, api, options) => {
	const { preset19Transforms } = options;

	const transformNames = new Set(preset19Transforms.split(","));
	/**
	 * @type {Array<(file: import('jscodeshift').FileInfo, api: import('jscodeshift').API, options: import('jscodeshift').Options) => string>}
	 */
	const transforms = [];
	if (transformNames.has("deprecated-prop-types-types")) {
		transforms.push(deprecatedPropTypesTypes);
	}
	if (transformNames.has("deprecated-legacy-ref")) {
		transforms.push(deprecatedLegacyRefTransform);
	}
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
	if (transformNames.has("no-implicit-ref-callback-return")) {
		transforms.push(noImplicitRefCallbackReturnTransform);
	}
	if (transformNames.has("react-element-default-any-props")) {
		transforms.push(reactElementDefaultAnyPropsTransform);
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
