const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const reactElementDefaultAnyPropsTransform = require("../react-element-default-any-props");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		reactElementDefaultAnyPropsTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		},
	);
}

test("not modified", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
			declare const element: React.ReactElement<unknown>
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const element: React.ReactElement<unknown>"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
      import { ReactElement } from 'react';
      declare const element: ReactElement
    `),
	).toMatchInlineSnapshot(`
		"import { ReactElement } from 'react';
		declare const element: ReactElement<any>"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
      import { type ReactElement } from 'react';
      declare const element: ReactElement
    `),
	).toMatchInlineSnapshot(`
		"import { type ReactElement } from 'react';
		declare const element: ReactElement<any>"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
      import { type ReactElement as MyReactElement } from 'react';
      declare const element: MyReactElement
    `),
	).toMatchInlineSnapshot(`
		"import { type ReactElement as MyReactElement } from 'react';
		declare const element: MyReactElement"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      declare const element: React.ReactElement
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const element: React.ReactElement<any>"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
			import * as React from 'react';
			createAction<React.ReactElement>()
			createAction<React.ReactElement<unknown>>()
		`),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createAction<React.ReactElement<any>>()
		createAction<React.ReactElement<unknown>>()"
	`);
});
