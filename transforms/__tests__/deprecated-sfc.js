const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedSFCTransform = require("../deprecated-sfc");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(deprecatedSFCTransform, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

describe("transform deprecated-sfc", () => {
	test("not modified", () => {
		expect(
			applyTransform(`
				import { FC } from 'react';
				FC;
    `),
		).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		FC;"
	`);
	});

	test("named import", () => {
		expect(
			applyTransform(`
				import { SFC } from 'react';
				SFC;
    `),
		).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		FC;"
	`);
	});

	test("named renamed import", () => {
		expect(
			applyTransform(`
				import { SFC as MySFC } from 'react';
				MySFCElement;
    `),
		).toMatchInlineSnapshot(`
		"import { FC as MySFC } from 'react';
		MySFCElement;"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				React.SFC;
    `),
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		React.FC;"
	`);
	});

	test("false-positive rename on different namespace", () => {
		expect(
			applyTransform(`
				import * as Preact from 'preact';
				Preact.SFC;
    `),
		).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		Preact.FC;"
	`);
	});
});
