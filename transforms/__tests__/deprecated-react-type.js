const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedReactTypeTransform = require("../deprecated-react-type");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactTypeTransform,
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
				import { ElementType } from 'react';
				declare const a: ElementType;
    `),
	).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
		declare const a: ElementType;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
			import { ReactType } from 'react';
			declare const a: ReactType;
			declare const b: ReactType<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
		declare const a: ElementType;
		declare const b: ElementType<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
			import { type ReactType } from 'react';
			declare const a: ReactType;
			declare const b: ReactType<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { type ElementType } from 'react';
		declare const a: ElementType;
		declare const b: ElementType<T>;"
	`);
});

test("named type import with existing target import", () => {
	expect(
		applyTransform(`
			import { type ReactType, ElementType } from 'react';
			declare const a: ReactType;
			declare const b: ReactType<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
		declare const a: ElementType;
		declare const b: ElementType<T>;"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
			import { ReactType as MyReactType } from 'react';
			declare const a: MyReactType;
			declare const b: MyReactType<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { ReactType as MyReactType } from 'react';
		declare const a: MyReactType;
		declare const b: MyReactType<T>;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      declare const a: React.ReactType;
      declare const b: React.ReactType<T>;
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const a: React.ElementType;
		declare const b: React.ElementType<T>;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
      import * as Preact from 'preact';
      declare const a: Preact.ReactType;
    `),
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		declare const a: Preact.ElementType;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.ReactType>();
      createComponent<React.ReactType<T>>();
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.ElementType>();
		createComponent<React.ElementType<T>>();"
	`);
});
