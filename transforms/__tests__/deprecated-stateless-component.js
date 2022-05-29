const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedStatelessComponent = require("../deprecated-stateless-component");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedStatelessComponent,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		}
	);
}

describe("transform deprecated-stateless-component", () => {
	test("not modified", () => {
		expect(
			applyTransform(`
				import { FunctionComponent } from 'react';
				FunctionComponent;
    `)
		).toMatchInlineSnapshot(`
		"import { FunctionComponent } from 'react';
						FunctionComponent;"
	`);
	});

	test("named import", () => {
		expect(
			applyTransform(`
				import { StatelessComponent } from 'react';
				StatelessComponent;
			`)
		).toMatchInlineSnapshot(`
		"import { FunctionComponent } from 'react';
						FunctionComponent;"
	`);
	});

	test("named renamed import", () => {
		expect(
			applyTransform(`
				import { StatelessComponent as MyStatelessComponent } from 'react';
				MyStatelessComponent;
    `)
		).toMatchInlineSnapshot(`
		"import { FunctionComponent as MyStatelessComponent } from 'react';
						MyStatelessComponent;"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				React.StatelessComponent;
    `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
						React.FunctionComponent;"
	`);
	});

	test("false-positive rename on different namespace", () => {
		expect(
			applyTransform(`
				import * as Preact from 'preact';
				Preact.StatelessComponent;
    `)
		).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
						Preact.FunctionComponent;"
	`);
	});
});
