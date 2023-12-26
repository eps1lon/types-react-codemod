const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedReactTextTransform = require("../deprecated-react-text");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactTextTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		}
	);
}

describe("transform deprecated-react-text", () => {
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
      import { ReactText } from 'react';
		interface Props {
				children?: ReactText;
			}
    `)
		).toMatchInlineSnapshot(`
		"import { ReactText } from 'react';
		interface Props {
				children?: number | string;
			}"
	`);
	});

	test("false-negative named renamed import", () => {
		expect(
			applyTransform(`
      import { ReactText as MyReactText } from 'react';
      interface Props {
				children?: MyReactText;
			}
    `)
		).toMatchInlineSnapshot(`
		"import { ReactText as MyReactText } from 'react';
		   interface Props {
			children?: MyReactText;
		}"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
      import * as React from 'react';
      interface Props {
				children?: React.ReactText;
			}
    `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		   interface Props {
			children?: number | string;
		}"
	`);
	});
});
