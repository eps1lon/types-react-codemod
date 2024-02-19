const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedStatelessComponent = require("../deprecated-stateless-component");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedStatelessComponent,
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
				import { FunctionComponent } from 'react';
				declare const a: FunctionComponent;
    `),
	).toMatchInlineSnapshot(`
		"import { FunctionComponent } from 'react';
		declare const a: FunctionComponent;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
				import { StatelessComponent } from 'react';
				declare const a: StatelessComponent;
				declare const b: StatelessComponent<T>;
			`),
	).toMatchInlineSnapshot(`
		"import { FunctionComponent } from 'react';
		declare const a: FunctionComponent;
		declare const b: FunctionComponent<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
				import { type StatelessComponent } from 'react';
				declare const a: StatelessComponent;
				declare const b: StatelessComponent<T>;
			`),
	).toMatchInlineSnapshot(`
		"import { type FunctionComponent } from 'react';
		declare const a: FunctionComponent;
		declare const b: FunctionComponent<T>;"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
				import { StatelessComponent, FunctionComponent } from 'react';
				declare const a: StatelessComponent;
				declare const b: StatelessComponent<T>;
			`),
	).toMatchInlineSnapshot(`
		"import { FunctionComponent } from 'react';
		declare const a: FunctionComponent;
		declare const b: FunctionComponent<T>;"
	`);
});

test("named renamed import", () => {
	expect(
		applyTransform(`
				import { StatelessComponent as MyStatelessComponent } from 'react';
				declare const a: MyStatelessComponent;
				declare const b: MyStatelessComponent<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { StatelessComponent as MyStatelessComponent } from 'react';
		declare const a: MyStatelessComponent;
		declare const b: MyStatelessComponent<T>;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
				import * as React from 'react';
				declare const a: React.StatelessComponent;
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const a: React.FunctionComponent;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
				import * as Preact from 'preact';
				declare const a: Preact.StatelessComponent;
    `),
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		declare const a: Preact.FunctionComponent;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.StatelessComponent>();
      createComponent<React.StatelessComponent<T>>();
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.FunctionComponent>();
		createComponent<React.FunctionComponent<T>>();"
	`);
});
