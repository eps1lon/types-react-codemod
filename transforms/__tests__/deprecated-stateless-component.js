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
		}
	);
}

test("not modified", () => {
	expect(
		applyTransform(`
				import { FunctionComponent } from 'react';
				FunctionComponent;
    `)
	).toMatchInlineSnapshot(`
		"import { FunctionComponent } from 'react';
		FunctionComponent;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
				import { StatelessComponent } from 'react';
				StatelessComponent;
				StatelessComponent<T>;
			`)
	).toMatchInlineSnapshot(`
		"import { FunctionComponent } from 'react';
		FunctionComponent;
		FunctionComponent<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
				import { type StatelessComponent } from 'react';
				StatelessComponent;
				StatelessComponent<T>;
			`)
	).toMatchInlineSnapshot(`
		"import { type FunctionComponent } from 'react';
		FunctionComponent;
		FunctionComponent<T>;"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
				import { StatelessComponent, FunctionComponent } from 'react';
				StatelessComponent;
				StatelessComponent<T>;
			`)
	).toMatchInlineSnapshot(`
		"import { FunctionComponent, FunctionComponent } from 'react';
		FunctionComponent;
		FunctionComponent<T>;"
	`);
});

test("named renamed import", () => {
	expect(
		applyTransform(`
				import { StatelessComponent as MyStatelessComponent } from 'react';
				MyStatelessComponent;
				MyStatelessComponent<T>;
    `)
	).toMatchInlineSnapshot(`
		"import { FunctionComponent as MyStatelessComponent } from 'react';
		MyStatelessComponent;
		MyStatelessComponent<T>;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
				import * as React from 'react';
				React.StatelessComponent;
    `)
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		React.FunctionComponent;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
				import * as Preact from 'preact';
				Preact.StatelessComponent;
    `)
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		Preact.FunctionComponent;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.StatelessComponent>();
      createComponent<React.StatelessComponent<T>>();
    `)
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.StatelessComponent>();
		createComponent<React.StatelessComponent<T>>();"
	`);
});
