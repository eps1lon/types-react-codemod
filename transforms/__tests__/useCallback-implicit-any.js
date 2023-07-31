const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const useCallbackAnyTransform = require("../useCallback-implicit-any");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(useCallbackAnyTransform, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

/**
 * "bare" means the call is not assigned to anything e.g. `useCallback();`
 * Not "bare" would be `const foo = useCallback()`.
 * Made that term up here though.
 */
describe("transform useCallback-any", () => {
	test("empty useCallback", () => {
		expect(
			applyTransform(`
        useCallback();
    `),
		).toMatchInlineSnapshot(`"useCallback();"`);
	});

	test("bare, missing type", () => {
		expect(
			applyTransform(`
        useCallback((event) => {});
    `),
		).toMatchInlineSnapshot(`"useCallback((event: any) => {});"`);
	});

	test("bare, missing type with object destructuring params", () => {
		expect(
			applyTransform(`
        useCallback(({ event }) => {});
    `),
		).toMatchInlineSnapshot(`
		"useCallback(({
		  event
		}: any) => {});"
	`);
	});

	test("bare, some missing types", () => {
		expect(
			applyTransform(`
        useCallback((event, index: number, more) => {});
    `),
		).toMatchInlineSnapshot(
			`"useCallback((event: any, index: number, more: any) => {});"`,
		);
	});

	test("bare, with type", () => {
		expect(
			applyTransform(`
        useCallback((event: unknown) => {});
    `),
		).toMatchInlineSnapshot(`"useCallback((event: unknown) => {});"`);
	});

	test("bare, namespace import", () => {
		expect(
			applyTransform(`
        React.useCallback((event) => {});
    `),
		).toMatchInlineSnapshot(`"React.useCallback((event: any) => {});"`);
	});

	test("bare, function expression", () => {
		expect(
			applyTransform(`
        React.useCallback(function (event) {});
    `),
		).toMatchInlineSnapshot(`"React.useCallback(function (event: any) {});"`);
	});

	test("bare, namespace object property access", () => {
		expect(
			applyTransform(`
        React['useCallback']((event) => {});
    `),
		).toMatchInlineSnapshot(`"React['useCallback']((event: any) => {});"`);
	});

	test("false-negative missing type on aliased import", () => {
		expect(
			applyTransform(`
        import { useCallback as useBuiltinCallback } from "react";
        useBuiltinCallback((event) => {});
    `),
		).toMatchInlineSnapshot(`
		"import { useCallback as useBuiltinCallback } from "react";
		useBuiltinCallback((event) => {});"
	`);
	});

	test("assigned, not inferrable", () => {
		expect(
			applyTransform(`
        const foo = useCallback((event) => {})
    `),
		).toMatchInlineSnapshot(`"const foo = useCallback((event: any) => {})"`);
	});

	test("assigned, inferrable", () => {
		expect(
			applyTransform(`
      const bar: Type = useCallback((event) => {})
    `),
		).toMatchInlineSnapshot(`"const bar: Type = useCallback((event) => {})"`);
	});

	test("bare, inferrable", () => {
		expect(
			applyTransform(`
      	useCallback<Event>((event) => {})
    `),
		).toMatchInlineSnapshot(`"useCallback<Event>((event) => {})"`);
	});

	test("false-positive, may be inferrable", () => {
		expect(
			applyTransform(`
        call(useCallback((event) => {}))
    `),
		).toMatchInlineSnapshot(`"call(useCallback((event: any) => {}))"`);
	});

	test("bare, variable as callback", () => {
		expect(
			applyTransform(`
      useCallback(call)
    `),
		).toMatchInlineSnapshot(`"useCallback(call)"`);
	});

	test("noop", () => {
		expect(
			applyTransform(`
				useState(() => {})
    `),
		).toMatchInlineSnapshot(`"useState(() => {})"`);
	});
});
