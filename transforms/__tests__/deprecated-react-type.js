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
		}
	);
}

test("not modified", () => {
	expect(
		applyTransform(`
				import { ElementType } from 'react';
				ElementType;
    `)
	).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
		ElementType;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
      import { ReactType } from 'react';
      ReactType;
      ReactType<T>;
    `)
	).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
		ElementType;
		ElementType<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
      import { type ReactType } from 'react';
      ReactType;
      ReactType<T>;
    `)
	).toMatchInlineSnapshot(`
		"import { type ElementType } from 'react';
		ElementType;
		ElementType<T>;"
	`);
});

test("named type import with existing target import", () => {
	expect(
		applyTransform(`
      import { type ReactType, ElementType } from 'react';
      ReactType;
      ReactType<T>;
    `)
	).toMatchInlineSnapshot(`
		"import { type ElementType, ElementType } from 'react';
		ElementType;
		ElementType<T>;"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
      import { ReactType as MyReactType } from 'react';
      MyReactType;
      MyReactType<T>;
    `)
	).toMatchInlineSnapshot(`
		"import { ElementType as MyReactType } from 'react';
		MyReactType;
		MyReactType<T>;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      React.ReactType;
      React.ReactType<T>;
    `)
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		React.ElementType;
		React.ElementType<T>;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
      import * as Preact from 'preact';
      Preact.ReactType;
    `)
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		Preact.ElementType;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.ReactType>();
      createComponent<React.ReactType<T>>();
    `)
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.ReactType>();
		createComponent<React.ReactType<T>>();"
	`);
});
