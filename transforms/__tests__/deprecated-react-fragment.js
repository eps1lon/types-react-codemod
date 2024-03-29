const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedReactFragmentTransform = require("../deprecated-react-fragment");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactFragmentTransform,
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
      import { ReactFragment } from 'react';
		interface Props {
				children?: ReactFragment;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactNode } from 'react';
		interface Props {
				children?: Iterable<ReactNode>;
			}"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
      import { type ReactFragment } from 'react';
		interface Props {
				children?: ReactFragment;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { type ReactNode } from 'react';
		interface Props {
				children?: Iterable<ReactNode>;
			}"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
      import { ReactFragment, ReactNode } from 'react';
		interface Props {
				children?: ReactFragment;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactNode } from 'react';
		interface Props {
				children?: Iterable<ReactNode>;
			}"
	`);
});

test("named import with existing ReactNode type import", () => {
	expect(
		applyTransform(`
      import { ReactFragment, type ReactNode } from 'react';
		interface Props {
				children?: ReactFragment;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { type ReactNode } from 'react';
		interface Props {
				children?: Iterable<ReactNode>;
			}"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
      import { ReactFragment as MyReactFragment } from 'react';
      interface Props {
				children?: MyReactFragment;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { ReactFragment as MyReactFragment } from 'react';
		   interface Props {
			children?: MyReactFragment;
		}"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      interface Props {
				children?: React.ReactFragment;
			}
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		   interface Props {
			children?: Iterable<React.ReactNode>;
		}"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.ReactFragment>();
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<Iterable<React.ReactNode>>();"
	`);
});
