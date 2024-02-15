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
    `),
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
			`),
		).toMatchInlineSnapshot(`
		"import type { JSX } from "react";
		declare const element: JSX.Element;"
	`);
	});

	test("existing default import", () => {
		expect(
			applyTransform(`
				import React from 'react';
				declare const element: JSX.Element;
			`),
		).toMatchInlineSnapshot(`
		"import React, { type JSX } from 'react';
		declare const element: JSX.Element;"
	`);
	});

	test("existing type default import", () => {
		expect(
			applyTransform(`
				import type React from 'react';
				declare const element: JSX.Element;
			`),
		).toMatchInlineSnapshot(`
		"import type React from 'react';
		import type { JSX } from "react";
		declare const element: JSX.Element;"
	`);
	});

	test("existing namespace import", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				declare const element: JSX.Element;
			`),
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		import type { JSX } from "react";
		declare const element: JSX.Element;"
	`);
	});

	test("existing type namespace import", () => {
		expect(
			applyTransform(`
				import type * as React from 'react';
				declare const element: JSX.Element;
			`),
		).toMatchInlineSnapshot(`
		"import type * as React from 'react';
		import type { JSX } from "react";
		declare const element: JSX.Element;"
	`);
	});

	test("existing named import with other named imports", () => {
		expect(
			applyTransform(`
				import { ReactNode } from 'react';
				declare const element: JSX.Element;
				declare const node: ReactNode;
			`),
		).toMatchInlineSnapshot(`
		"import { ReactNode, type JSX } from 'react';
		declare const element: JSX.Element;
		declare const node: ReactNode;"
	`);
	});

	test("existing named import with other named type imports", () => {
		expect(
			applyTransform(`
				import type { ReactNode } from 'react';
				declare const element: JSX.Element;
				declare const node: ReactNode;
			`),
		).toMatchInlineSnapshot(`
		"import type { ReactNode, JSX } from 'react';
		declare const element: JSX.Element;
		declare const node: ReactNode;"
	`);
	});

	test("existing named import", () => {
		expect(
			applyTransform(`
				import { JSX } from 'react';
				declare const element: JSX.Element;
			`),
		).toMatchInlineSnapshot(`
		"import { JSX } from 'react';
		declare const element: JSX.Element;"
	`);
	});

	test("existing namespace require", () => {
		expect(
			applyTransform(`
				const React = require('react');
				declare const element: JSX.Element;
			`),
		).toMatchInlineSnapshot(`
		"import type { JSX } from "react";
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
			`),
		).toMatchInlineSnapshot(`
		"import {} from 'react-dom'
		import {} from '@testing-library/react'

		import type { JSX } from "react";

		declare const element: JSX.Element;"
	`);
	});

	test("type parameters are preserved", () => {
		expect(
			applyTransform(`
				import * as React from 'react'

				declare const attributes: JSX.LibraryManagedAttributes<A, B>;
			`),
		).toMatchInlineSnapshot(`
		"import * as React from 'react'

		import type { JSX } from "react";

		declare const attributes: JSX.LibraryManagedAttributes<A, B>;"
	`);
	});
});
