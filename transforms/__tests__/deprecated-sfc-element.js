const { describe, expect, test } = require("@jest/globals");
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

describe("transform deprecated-sfc-element", () => {
	test("not modified", () => {
		expect(
			applyTransform(`
				import { FunctionComponentElement } from 'react';
				FunctionComponentElement;
    `),
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
    `),
		).toMatchInlineSnapshot(`
		"import { FunctionComponentElement } from 'react';
		FunctionComponentElement;"
	`);
	});

	test("named renamed import", () => {
		expect(
			applyTransform(`
				import { SFCElement as MySFCElement } from 'react';
				MySFCElement;
    `),
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
    `),
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		React.FunctionComponentElement;"
	`);
	});

	test("false-positive rename on different namespace", () => {
		expect(
			applyTransform(`
				import * as Preact from 'preact';
				Preact.SFCElement;
    `),
		).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		Preact.FunctionComponentElement;"
	`);
	});
});
