const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const noImplicitRefCallbackReturnTransform = require("../no-implicit-ref-callback-return");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		noImplicitRefCallbackReturnTransform,
		options,
		{
			path: "test.tsx",
			source: dedent(source),
		},
	);
}

test("not modified", () => {
	expect(
		applyTransform(`
				<div ref={current => {instance = current}} />
    `),
	).toMatchInlineSnapshot(`"<div ref={current => {instance = current}} />"`);
});

test("replaces implicit return of assignment expression with block", () => {
	expect(
		applyTransform(`
				<div ref={current => (instance = current)} />
    `),
	).toMatchInlineSnapshot(`"<div ref={current => (instance = current)} />"`);
});

test("replaces implicit return of identifier with block", () => {
	expect(
		applyTransform(`
				<div ref={current => current} />
    `),
	).toMatchInlineSnapshot(`"<div ref={current => current} />"`);
});

test("function expression", () => {
	expect(
		applyTransform(`
				<div ref={function (current) { instance = current }} />
    `),
	).toMatchInlineSnapshot(
		`"<div ref={function (current) { instance = current }} />"`,
	);
});

test("only applies to `ref` prop", () => {
	expect(
		applyTransform(`
				<div innerRef={current => (instance = current)} />
    `),
	).toMatchInlineSnapshot(
		`"<div innerRef={current => (instance = current)} />"`,
	);
});
