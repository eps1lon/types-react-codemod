const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedReactChildTransform = require("../deprecated-react-child");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactChildTransform,
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
      import { ReactChild } from 'react';
		interface Props {
				children?: ReactChild;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactElement } from 'react';
		interface Props {
				children?: ReactElement | number | string;
			}"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
      import { type ReactChild } from 'react';
		interface Props {
				children?: ReactChild;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { type ReactElement } from 'react';
		interface Props {
				children?: ReactElement | number | string;
			}"
	`);
});

test("named type import with existing target import", () => {
	expect(
		applyTransform(`
      import { ReactChild, ReactElement } from 'react';
		interface Props {
				children?: ReactChild;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactElement } from 'react';
		interface Props {
				children?: ReactElement | number | string;
			}"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
      import { ReactChild as MyReactChild } from 'react';
      interface Props {
				children?: MyReactChild;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactChild as MyReactChild } from 'react';
		   interface Props {
			children?: MyReactChild;
		}"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      interface Props {
				children?: React.ReactChild;
			}
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		   interface Props {
			children?: React.ReactElement | number | string;
		}"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
			import * as React from 'react';
			createAction<React.ReactChild>()
		`),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createAction<React.ReactElement | number | string>()"
	`);
});
