const { beforeEach, describe, expect, jest, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");

describe("preset-19", () => {
	let preset19Transform;
	let deprecatedReactChildTransform;
	let deprecatedReactTextTransform;
	let deprecatedVoidFunctionComponentTransform;
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

		deprecatedReactChildTransform = mockTransform("../deprecated-react-child");
		deprecatedReactTextTransform = mockTransform("../deprecated-react-text");
		deprecatedVoidFunctionComponentTransform = mockTransform(
			"../deprecated-void-function-component",
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
				"deprecated-react-child",
				"deprecated-react-text",
				"deprecated-void-function-component",
				"refobject-defaults",
				"scoped-jsx",
				"useRef-required-initial",
			].join(","),
		});

		expect(deprecatedReactChildTransform).toHaveBeenCalled();
		expect(deprecatedReactTextTransform).toHaveBeenCalled();
		expect(deprecatedVoidFunctionComponentTransform).toHaveBeenCalled();
		expect(refobjectDefaultsTransform).toHaveBeenCalled();
		expect(scopedJSXTransform).toHaveBeenCalled();
		expect(useRefRequiredInitialTransform).toHaveBeenCalled();
	});
});
