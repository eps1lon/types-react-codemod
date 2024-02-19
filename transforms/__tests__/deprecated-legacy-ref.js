const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedLegacyRefTransform = require("../deprecated-legacy-ref");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedLegacyRefTransform,
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
      import { LegacyRef } from 'react';
		interface Props<T> {
				legacyRef?: LegacyRef;
				legacyRefTyped?: LegacyRef<T>;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { Ref } from 'react';
		interface Props<T> {
				legacyRef?: Ref;
				legacyRefTyped?: Ref<T>;
			}"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
      import { LegacyRef, Ref } from 'react';
		interface Props {
				legacyRef?: LegacyRef;
        ref?: Ref;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { Ref } from 'react';
		interface Props {
				legacyRef?: Ref;
		      ref?: Ref;
			}"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
      import { LegacyRef as MyLegacyRef } from 'react';
      interface Props {
				ref?: MyLegacyRef;
			}
    `),
	).toMatchInlineSnapshot(`
		"import { LegacyRef as MyLegacyRef } from 'react';
		   interface Props {
			ref?: MyLegacyRef;
		}"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      interface Props<T> {
				ref?: React.LegacyRef;
				refTyped?: React.LegacyRef<T>;
			}
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		   interface Props<T> {
			ref?: React.Ref;
			refTyped?: React.Ref<T>;
		}"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
			import * as React from 'react';
			createAction<React.LegacyRef>()
			createAction<React.LegacyRef<unknown>>()
		`),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createAction<React.Ref>()
		createAction<React.Ref<unknown>>()"
	`);
});
