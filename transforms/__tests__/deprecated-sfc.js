const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedSFCTransform = require("../deprecated-sfc");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(deprecatedSFCTransform, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

test("not modified", () => {
	expect(
		applyTransform(`
				import { FC } from 'react';
				FC;
    `),
	).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		FC;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
				import { SFC } from 'react';
				SFC;
				SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		FC;
		FC<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
				import { type SFC } from 'react';
				SFC;
				SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { type FC } from 'react';
		FC;
		FC<T>;"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
				import { SFC } from 'react';
				SFC;
				SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		FC;
		FC<T>;"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
				import { SFC as MySFC } from 'react';
				MySFC;
				MySFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { FC as MySFC } from 'react';
		MySFC;
		MySFC<T>;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
				import * as React from 'react';
				React.SFC;
				React.SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		React.FC;
		React.FC<T>;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
				import * as Preact from 'preact';
				Preact.SFC;
				Preact.SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		Preact.FC;
		Preact.FC<T>;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.SFC>();
      createComponent<React.SFC<T>>();
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.SFC>();
		createComponent<React.SFC<T>>();"
	`);
});
