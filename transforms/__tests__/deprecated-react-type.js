import { describe, expect, test } from "@jest/globals";
import dedent from "dedent";
import * as JscodeshiftTestUtils from "jscodeshift/dist/testUtils";
import deprecatedReactTypeTransform from "../deprecated-react-type";

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactTypeTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		}
	);
}

describe("transform deprecated-react-type", () => {
	test("not modified", () => {
		expect(
			applyTransform(`
				import { ElementType } from 'react';
				ElementType;
    `)
		).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
						ElementType;"
	`);
	});

	test("named import", () => {
		expect(
			applyTransform(`
      import { ReactType } from 'react';
      ReactType;
    `)
		).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
		ElementType;"
	`);
	});

	test("named renamed import", () => {
		expect(
			applyTransform(`
      import { ReactType as MyReactType } from 'react';
      MyReactType;
    `)
		).toMatchInlineSnapshot(`
		"import { ElementType as MyReactType } from 'react';
		MyReactType;"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
      import * as React from 'react';
      React.ReactType;
    `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		React.ElementType;"
	`);
	});

	test("false-positive rename on different namespace", () => {
		expect(
			applyTransform(`
      import * as Preact from 'preact';
      Preact.ReactType;
    `)
		).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		Preact.ElementType;"
	`);
	});
});
