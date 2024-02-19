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
				declare const a: FC;
    `),
	).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		declare const a: FC;"
	`);
});

test("named import", () => {
	expect(
		applyTransform(`
				import { SFC } from 'react';
				declare const a: SFC;
				declare const b: SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		declare const a: FC;
		declare const b: FC<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
				import { type SFC } from 'react';
				declare const a: SFC;
				declare const b: SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { type FC } from 'react';
		declare const a: FC;
		declare const b: FC<T>;"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
				import { SFC } from 'react';
				declare const a: SFC;
				declare const b: SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { FC } from 'react';
		declare const a: FC;
		declare const b: FC<T>;"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
				import { SFC as MySFC } from 'react';
				declare const a: MySFC;
				declare const b: MySFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { SFC as MySFC } from 'react';
		declare const a: MySFC;
		declare const b: MySFC<T>;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
				import * as React from 'react';
				declare const a: React.SFC;
				declare const b: React.SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const a: React.FC;
		declare const b: React.FC<T>;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
				import * as Preact from 'preact';
				declare const a: Preact.SFC;
				declare const b: Preact.SFC<T>;
    `),
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		declare const a: Preact.FC;
		declare const b: Preact.FC<T>;"
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
		createComponent<React.FC>();
		createComponent<React.FC<T>>();"
	`);
});
