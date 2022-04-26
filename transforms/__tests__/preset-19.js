import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import dedent from "dedent";
import * as JscodeshiftTestUtils from "jscodeshift/dist/testUtils";

describe("preset-19", () => {
	let preset19Transform;
	let deprecatedReactTextTransform;

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
				return {
					__esModule: true,
					default: transform,
				};
			});

			return transform;
		}

		deprecatedReactTextTransform = mockTransform("../deprecated-react-text");

		preset19Transform = require("../preset-19");
	});

	test("applies subset", () => {
		applyTransform("", {
			preset19Transforms: "deprecated-react-text",
		});

		expect(deprecatedReactTextTransform).toHaveBeenCalled();
	});

	test("applies all", () => {
		applyTransform("", {
			preset19Transforms: ["deprecated-react-text"].join(","),
		});

		applyTransform("", {
			preset19Transforms: "deprecated-react-text",
		});

		expect(deprecatedReactTextTransform).toHaveBeenCalled();
	});
});
