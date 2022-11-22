const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const useGlobalTypes = require("../use-global-types");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(useGlobalTypes, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

describe("use global types", () => {
	test("not modified imports with *", () => {
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
						children?: React.ReactNode;
					}"
	`);
	});

	test("single import gets removed", () => {
		expect(
			applyTransform(`
      import { ReactChild } from 'react';
		interface Props {
				children?: ReactChild;
			}
    `)
		).toMatchInlineSnapshot(`
		"interface Props {
		        children?: React.ReactChild;
		    }"
	`);
	});

	test("two imports gets removed", () => {
		expect(
			applyTransform(`
      import { ReactChild, MouseEvent } from 'react';
		interface Props {
				children?: ReactChild;
				onClick?: MouseEvent;
			}
    `)
		).toMatchInlineSnapshot(`
		"interface Props {
		        children?: React.ReactChild;
		        onClick?: React.MouseEvent;
		    }"
	`);
	});

	test("named import with multiple types", () => {
		expect(
			applyTransform(`
	  import { ReactChild, ReactNode } from 'react';
		interface Props {
				children?: ReactChild;
			}
	`)
		).toMatchInlineSnapshot(`
		"import { ReactNode } from 'react';
				interface Props {
						children?: React.ReactChild;
					}"
	`);
	});

	test("mixed imports with unused", () => {
		expect(
			applyTransform(`
	  import { ReactChild, ReactNode, useState, useCallback } from 'react';
		interface Props {
				children?: ReactChild;
			}

			function MyComponent() {
				const [state, setState] = useState<number>(0);
				
				return state
			}
	`)
		).toMatchInlineSnapshot(`
		"import { ReactNode, useState, useCallback } from 'react';
				interface Props {
						children?: React.ReactChild;
					}

					function MyComponent() {
						const [state, setState] = useState<number>(0);
						
						return state
					}"
	`);
	});
});
