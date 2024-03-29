const { beforeEach, describe, expect, jest, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");

describe("preset-19", () => {
	let preset19Transform;
	let deprecatedPropTypesTypes;
	let deprecatedLegacyRefTransform;
	let deprecatedReactChildTransform;
	let deprecatedReactNodeArrayTransform;
	let deprecatedReactFragmentTransform;
	let deprecatedReactTextTransform;
	let deprecatedVoidFunctionComponentTransform;
	let noImplicitRefCallbackReturnTransform;
	let refobjectDefaultsTransform;
	let scopedJSXTransform;
	let useRefRequiredInitialTransform;

	function applyTransform(source, options = {}) {
		return JscodeshiftTestUtils.applyTransform(preset19Transform, options, {
			path: "test.d.ts",
			source: dedent(source),
		});
	}

	beforeEach(() => {
		jest.resetModules();

		function mockTransform(moduleName) {
			const transform = jest.fn();

			jest.doMock(moduleName, () => {
				return transform;
			});

			return transform;
		}

		deprecatedPropTypesTypes = mockTransform("../deprecated-prop-types-types");
		deprecatedLegacyRefTransform = mockTransform("../deprecated-legacy-ref");
		deprecatedReactChildTransform = mockTransform("../deprecated-react-child");
		deprecatedReactNodeArrayTransform = mockTransform(
			"../deprecated-react-node-array",
		);
		deprecatedReactFragmentTransform = mockTransform(
			"../deprecated-react-fragment",
		);
		deprecatedReactTextTransform = mockTransform("../deprecated-react-text");
		deprecatedVoidFunctionComponentTransform = mockTransform(
			"../deprecated-void-function-component",
		);
		noImplicitRefCallbackReturnTransform = mockTransform(
			"../no-implicit-ref-callback-return",
		);
		refobjectDefaultsTransform = mockTransform("../refobject-defaults");
		scopedJSXTransform = mockTransform("../scoped-jsx");
		useRefRequiredInitialTransform = mockTransform(
			"../useRef-required-initial",
		);

		preset19Transform = require("../preset-19");
	});

	test("applies subset", () => {
		applyTransform("", {
			preset19Transforms: "deprecated-react-text",
		});

		expect(deprecatedReactChildTransform).not.toHaveBeenCalled();
		expect(deprecatedReactTextTransform).toHaveBeenCalled();
		expect(deprecatedVoidFunctionComponentTransform).not.toHaveBeenCalled();
	});

	test("applies all", () => {
		applyTransform("", {
			preset19Transforms: [
				"deprecated-prop-types-types",
				"deprecated-legacy-ref",
				"deprecated-react-child",
				"deprecated-react-fragment",
				"deprecated-react-node-array",
				"deprecated-react-text",
				"deprecated-void-function-component",
				"no-implicit-ref-callback-return",
				"refobject-defaults",
				"scoped-jsx",
				"useRef-required-initial",
			].join(","),
		});

		expect(deprecatedPropTypesTypes).toHaveBeenCalled();
		expect(deprecatedLegacyRefTransform).toHaveBeenCalled();
		expect(deprecatedReactChildTransform).toHaveBeenCalled();
		expect(deprecatedReactNodeArrayTransform).toHaveBeenCalled();
		expect(deprecatedReactFragmentTransform).toHaveBeenCalled();
		expect(deprecatedReactTextTransform).toHaveBeenCalled();
		expect(deprecatedVoidFunctionComponentTransform).toHaveBeenCalled();
		expect(noImplicitRefCallbackReturnTransform).toHaveBeenCalled();
		expect(refobjectDefaultsTransform).toHaveBeenCalled();
		expect(scopedJSXTransform).toHaveBeenCalled();
		expect(useRefRequiredInitialTransform).toHaveBeenCalled();
	});
});
