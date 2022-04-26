import { describe, expect, test } from "@jest/globals";
import dedent from "dedent";
import * as JscodeshiftTestUtils from "jscodeshift/dist/testUtils";
import deprecatedReactTextTransform from "../deprecated-react-text";

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
