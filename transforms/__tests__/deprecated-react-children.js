const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedReactChildrenTransform = require("../deprecated-react-children");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactChildrenTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		},
	);
}

describe("transform deprecated-react-child", () => {
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

	test("named import", () => {
		expect(
			applyTransform(`
      import { ReactChildren } from 'react';
			const children: ReactChildren = React.Children;
    `),
		).toMatchInlineSnapshot(`
		import { ReactChildren } from 'react';
		const children: typeof ReactChildren = React.Children;
	`);
	});

	test("false-negative named renamed import", () => {
		expect(
			applyTransform(`
      import { ReactChildren as MyReactChildren } from 'react';
			const children: ReactChildren = React.Children;
    `),
		).toMatchInlineSnapshot(`
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
      import * as React from 'react';
			const children: React.ReactChildren = React.Children;
    `),
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		   interface Props {
			children?: React.ReactElement | number | string;
		}"
	`);
	});
});
