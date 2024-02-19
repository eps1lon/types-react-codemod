const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedSFCElementTransform = require("../deprecated-sfc-element");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedSFCElementTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		}
	);
}

test("not modified", () => {
	expect(
		applyTransform(`
				import { FunctionComponentElement } from 'react';
				FunctionComponentElement;
    `)
	).toMatchInlineSnapshot(`
		"import { FunctionComponentElement } from 'react';
		FunctionComponentElement;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
				import { SFCElement } from 'react';
				SFCElement;
				SFCElement<T>;
    `)
	).toMatchInlineSnapshot(`
		"import { FunctionComponentElement } from 'react';
		FunctionComponentElement;
		FunctionComponentElement<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
				import { type SFCElement } from 'react';
				SFCElement;
				SFCElement<T>;
    `)
	).toMatchInlineSnapshot(`
		"import { type FunctionComponentElement } from 'react';
		FunctionComponentElement;
		FunctionComponentElement<T>;"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
				import { SFCElement as MySFCElement } from 'react';
				MySFCElement;
    `)
	).toMatchInlineSnapshot(`
		"import { FunctionComponentElement as MySFCElement } from 'react';
		MySFCElement;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
				import * as React from 'react';
				React.SFCElement;
				React.SFCElement<T>;
    `)
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		React.FunctionComponentElement;
		React.FunctionComponentElement<T>;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
				import * as Preact from 'preact';
				Preact.SFCElement;
    `)
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		Preact.FunctionComponentElement;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.SFCElement>();
      createComponent<React.SFCElement<T>>();
    `)
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.SFCElement>();
		createComponent<React.SFCElement<T>>();"
	`);
});
