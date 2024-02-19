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
		},
	);
}

test("not modified", () => {
	expect(
		applyTransform(`
				import { FunctionComponentElement } from 'react';
				declare const a: FunctionComponentElement;
    `),
	).toMatchInlineSnapshot(`
		"import { FunctionComponentElement } from 'react';
		declare const a: FunctionComponentElement;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
				import { SFCElement } from 'react';
				declare const a: SFCElement;
				declare const b: SFCElement<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { FunctionComponentElement } from 'react';
		declare const a: FunctionComponentElement;
		declare const b: FunctionComponentElement<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
				import { type SFCElement } from 'react';
				declare const a: SFCElement;
				declare const b: SFCElement<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { type FunctionComponentElement } from 'react';
		declare const a: FunctionComponentElement;
		declare const b: FunctionComponentElement<T>;"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
				import { SFCElement as MySFCElement } from 'react';
				MySFCElement;
    `),
	).toMatchInlineSnapshot(`
		"import { SFCElement as MySFCElement } from 'react';
		MySFCElement;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
				import * as React from 'react';
				declare const a: React.SFCElement;
				declare const b: React.SFCElement<T>;
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const a: React.FunctionComponentElement;
		declare const b: React.FunctionComponentElement<T>;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
				import * as Preact from 'preact';
				declare const b: Preact.SFCElement;
    `),
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		declare const b: Preact.FunctionComponentElement;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.SFCElement>();
      createComponent<React.SFCElement<T>>();
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.FunctionComponentElement>();
		createComponent<React.FunctionComponentElement<T>>();"
	`);
});
