const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedVoidFunctionComponentTransform = require("../deprecated-void-function-component");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedVoidFunctionComponentTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		}
	);
}

describe("transform deprecated-void-function-component", () => {
	test("not modified", () => {
		expect(
			applyTransform(`
				import { FC } from 'react';
				FC;
    `)
		).toMatchInlineSnapshot(`
		"import { FC } from 'react';
						FC;"
	`);
	});

	test("named import", () => {
		expect(
			applyTransform(`
				import { VFC, VoidFunctionComponent } from 'react';
				VFC;
				VoidFunctionComponent;
    `)
		).toMatchInlineSnapshot(`
		"import { FC, FunctionComponent } from 'react';
						FC;
						FunctionComponent;"
	`);
	});

	test("named renamed import", () => {
		expect(
			applyTransform(`
				import { VFC as MyVFC, VoidFunctionComponent as MyVoidFunctionComponent } from 'react';
				MyVFC;
				MyVoidFunctionComponent;
    `)
		).toMatchInlineSnapshot(`
		"import { FC as MyVFC, FunctionComponent as MyVoidFunctionComponent } from 'react';
						MyVFC;
						MyVoidFunctionComponent;"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				React.VFC;
				React.VoidFunctionComponent;
    `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
						React.FC;
						React.FunctionComponent;"
	`);
	});

	test("false-positive rename on different namespace", () => {
		expect(
			applyTransform(`
				import * as Preact from 'preact';
				Preact.VFC;
				Preact.VoidFunctionComponent;
    `)
		).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
						Preact.FC;
						Preact.FunctionComponent;"
	`);
	});
});
