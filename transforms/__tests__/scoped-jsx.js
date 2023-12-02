const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const scopedJSXTransform = require("../scoped-jsx");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(scopedJSXTransform, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

describe("transform scoped-jsx", () => {
	test("not modified", () => {
		expect(
			applyTransform(`
			import * as React from 'react';
			interface Props {
				children?: ReactNode;
			}
    `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		interface Props {
			children?: ReactNode;
		}"
	`);
	});

	test("no import yet", () => {
		expect(
			applyTransform(`
				declare const element: JSX.Element;
			`)
		).toMatchInlineSnapshot(`
		"import { JSX } from "react";
		declare const element: JSX.Element;"
	`);
	});

	test("existing namespace import", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				declare const element: JSX.Element;
			`)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const element: React.JSX.Element;"
	`);
	});

	test("existing named import", () => {
		expect(
			applyTransform(`
				import {} from 'react';
				declare const element: JSX.Element;
			`)
		).toMatchInlineSnapshot(`
		"import {} from 'react';
		import { JSX } from "react";
		declare const element: JSX.Element;"
	`);
	});

	test("existing namespace require", () => {
		expect(
			applyTransform(`
				const React = require('react');
				declare const element: JSX.Element;
			`)
		).toMatchInlineSnapshot(`
		"import { JSX } from "react";
		const React = require('react');
		declare const element: JSX.Element;"
	`);
	});

	test("insert position", () => {
		expect(
			applyTransform(`
				import {} from 'react-dom'
				import {} from '@testing-library/react'

				declare const element: JSX.Element;
			`)
		).toMatchInlineSnapshot(`
		"import {} from 'react-dom'
		import {} from '@testing-library/react'

		import { JSX } from "react";

		declare const element: JSX.Element;"
	`);
	});

	test("type parameters are preserved", () => {
		expect(
			applyTransform(`
				import * as React from 'react'

				declare const attributes: JSX.LibraryManagedAttributes<A, B>;
			`)
		).toMatchInlineSnapshot(`
		"import * as React from 'react'

		declare const attributes: React.JSX.LibraryManagedAttributes<A, B>;"
	`);
	});
});
