const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedReactNodeArrayTransform = require("../deprecated-react-node-array");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactNodeArrayTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		}
	);
}

describe("transform deprecated-react-node-array", () => {
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

	test("named import", () => {
		expect(
			applyTransform(`
      import { ReactNodeArray } from 'react';
		interface Props {
				children?: ReactNodeArray;
			}
    `)
		).toMatchInlineSnapshot(`
		"import { ReactNode } from 'react';
		interface Props {
				children?: ReadonlyArray<ReactNode>;
			}"
	`);
	});

	test("named import with existing ReactNode import", () => {
		expect(
			applyTransform(`
      import { ReactNodeArray, ReactNode } from 'react';
		interface Props {
				children?: ReactNodeArray;
			}
    `)
		).toMatchInlineSnapshot(`
		"import { ReactNode } from 'react';
		interface Props {
				children?: ReadonlyArray<ReactNode>;
			}"
	`);
	});

	test("false-negative named renamed import", () => {
		expect(
			applyTransform(`
      import { ReactNodeArray as MyReactNodeArray } from 'react';
      interface Props {
				children?: MyReactNodeArray;
			}
    `)
		).toMatchInlineSnapshot(`
		"import { ReactNodeArray as MyReactNodeArray } from 'react';
		   interface Props {
			children?: MyReactNodeArray;
		}"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
      import * as React from 'react';
      interface Props {
				children?: React.ReactNodeArray;
			}
    `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		   interface Props {
			children?: ReadonlyArray<React.ReactNode>;
		}"
	`);
	});
});
