const { expect, test } = require("@jest/globals");
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
		},
	);
}

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
      import { ReactNodeArray } from 'react';
		interface Props {
				children?: ReactNodeArray;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactNode } from 'react';
		interface Props {
				children?: ReadonlyArray<ReactNode>;
			}"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
      import { type ReactNodeArray } from 'react';
		interface Props {
				children?: ReactNodeArray;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { type ReactNode } from 'react';
		interface Props {
				children?: ReadonlyArray<ReactNode>;
			}"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
      import { ReactNodeArray, ReactNode } from 'react';
		interface Props {
				children?: ReactNodeArray;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactNode } from 'react';
		interface Props {
				children?: ReadonlyArray<ReactNode>;
			}"
	`);
});

test("named import with existing target type import", () => {
	expect(
		applyTransform(`
      import { ReactNodeArray, type ReactNode } from 'react';
		interface Props {
				children?: ReactNodeArray;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { type ReactNode } from 'react';
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
    `),
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
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		   interface Props {
			children?: ReadonlyArray<React.ReactNode>;
		}"
	`);
});

test("in type parameters", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<ReactNodeArray>();
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<ReadonlyArray<ReactNode>>();"
	`);
});
