import { describe, expect, test } from "@jest/globals";
import dedent from "dedent";
import * as JscodeshiftTestUtils from "jscodeshift/dist/testUtils";
import deprecatedSFCTransform from "../deprecated-sfc";

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(deprecatedSFCTransform, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

describe("transform deprecated-sfc", () => {
	test("named import", () => {
		expect(
			applyTransform(`
				import { SFC } from 'react';
				SFC;
    `)
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
    `)
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
    `)
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
    `)
		).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
						Preact.FC;"
	`);
	});
});
