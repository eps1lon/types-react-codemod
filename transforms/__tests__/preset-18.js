const { beforeEach, describe, expect, jest, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");

describe("preset-18", () => {
	let preset18Transform;
	let contextAnyTransform;
	let deprecatedReactTypeTransform;
	let deprecatedSFCElementTransform;
	let deprecatedSFCTransform;
	let deprecatedStatelessComponentTransform;
	let implicitChildrenTransform;
	let useCallbackImplicitAnyTransform;

	function applyTransform(source, options = {}) {
		return JscodeshiftTestUtils.applyTransform(preset18Transform, options, {
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

		contextAnyTransform = mockTransform("../context-any");
		deprecatedReactTypeTransform = mockTransform("../deprecated-react-type");
		deprecatedSFCElementTransform = mockTransform("../deprecated-sfc-element");
		deprecatedSFCTransform = mockTransform("../deprecated-sfc");
		deprecatedStatelessComponentTransform = mockTransform(
			"../deprecated-stateless-component",
		);
		implicitChildrenTransform = mockTransform("../implicit-children");
		useCallbackImplicitAnyTransform = mockTransform(
			"../useCallback-implicit-any",
		);

		preset18Transform = require("../preset-18");
	});

	test("applies subset", () => {
		applyTransform("", {
			preset18Transforms: "context-any,deprecated-stateless-component",
		});

		expect(contextAnyTransform).toHaveBeenCalled();
		expect(deprecatedReactTypeTransform).not.toHaveBeenCalled();
		expect(deprecatedSFCElementTransform).not.toHaveBeenCalled();
		expect(deprecatedSFCTransform).not.toHaveBeenCalled();
		expect(deprecatedStatelessComponentTransform).toHaveBeenCalled();
		expect(implicitChildrenTransform).not.toHaveBeenCalled();
		expect(useCallbackImplicitAnyTransform).not.toHaveBeenCalled();
	});

	test("applies all", () => {
		applyTransform("", {
			preset18Transforms: [
				"context-any",
				"deprecated-react-type",
				"deprecated-sfc-element",
				"deprecated-sfc",
				"deprecated-stateless-component",
				"implicit-children",
				"useCallback-implicit-any",
			].join(","),
		});

		expect(contextAnyTransform).toHaveBeenCalled();
		expect(deprecatedReactTypeTransform).toHaveBeenCalled();
		expect(deprecatedSFCElementTransform).toHaveBeenCalled();
		expect(deprecatedSFCTransform).toHaveBeenCalled();
		expect(deprecatedStatelessComponentTransform).toHaveBeenCalled();
		expect(implicitChildrenTransform).toHaveBeenCalled();
		expect(useCallbackImplicitAnyTransform).toHaveBeenCalled();
	});
});
