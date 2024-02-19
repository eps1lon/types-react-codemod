const { expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedVoidFunctionComponentTransform = require("../deprecated-void-function-component");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedVoidFunctionComponentTransform,
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
				import { VFC, VoidFunctionComponent } from 'react';
				declare const a: VFC;
				declare const b: VFC<T>;
				declare const c: VoidFunctionComponent;
				declare const d: VoidFunctionComponent<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { FC, VoidFunctionComponent } from 'react';
		declare const a: FC;
		declare const b: FC<T>;
		declare const c: VoidFunctionComponent;
		declare const d: VoidFunctionComponent<T>;"
	`);
});

test("named type import", () => {
	expect(
		applyTransform(`
				import { type VFC, type VoidFunctionComponent } from 'react';
				declare const a: VFC;
				declare const b: VFC<T>;
				declare const c: VoidFunctionComponent;
				declare const d: VoidFunctionComponent<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { type FC, type VoidFunctionComponent } from 'react';
		declare const a: FC;
		declare const b: FC<T>;
		declare const c: VoidFunctionComponent;
		declare const d: VoidFunctionComponent<T>;"
	`);
});

test("named import with existing target import", () => {
	expect(
		applyTransform(`
				import { VFC, VoidFunctionComponent, FC, FunctionComponent } from 'react';
				declare const a: VFC;
				declare const b: VFC<T>;
				declare const c: VoidFunctionComponent;
				declare const d: VoidFunctionComponent<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { VoidFunctionComponent, FC, FunctionComponent } from 'react';
		declare const a: FC;
		declare const b: FC<T>;
		declare const c: VoidFunctionComponent;
		declare const d: VoidFunctionComponent<T>;"
	`);
});

test("false-negative named renamed import", () => {
	expect(
		applyTransform(`
				import { VFC as MyVFC, VoidFunctionComponent as MyVoidFunctionComponent } from 'react';
				declare const a: MyVFC;
				declare const b: MyVFC<T>;
				declare const c: MyVoidFunctionComponent;
				declare const d: MyVoidFunctionComponent<T>;
    `),
	).toMatchInlineSnapshot(`
		"import { VFC as MyVFC, VoidFunctionComponent as MyVoidFunctionComponent } from 'react';
		declare const a: MyVFC;
		declare const b: MyVFC<T>;
		declare const c: MyVoidFunctionComponent;
		declare const d: MyVoidFunctionComponent<T>;"
	`);
});

test("namespace import", () => {
	expect(
		applyTransform(`
				import * as React from 'react';
				declare const a: React.VFC;
				declare const b: React.VFC<T>;
				declare const c: React.VoidFunctionComponent;
				declare const d: React.VoidFunctionComponent<T>;
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		declare const a: React.FC;
		declare const b: React.FC<T>;
		declare const c: React.VoidFunctionComponent;
		declare const d: React.VoidFunctionComponent<T>;"
	`);
});

test("false-positive rename on different namespace", () => {
	expect(
		applyTransform(`
				import * as Preact from 'preact';
				declare const a: Preact.VFC;
				declare const b: Preact.VoidFunctionComponent;
    `),
	).toMatchInlineSnapshot(`
		"import * as Preact from 'preact';
		declare const a: Preact.FC;
		declare const b: Preact.VoidFunctionComponent;"
	`);
});

test("as type parameter", () => {
	expect(
		applyTransform(`
      import * as React from 'react';
      createComponent<React.VFC>();
      createComponent<React.VFC<T>>();
      createComponent<React.VoidFunctionComponent>();
      createComponent<React.VoidFunctionComponent<T>>();
    `),
	).toMatchInlineSnapshot(`
		"import * as React from 'react';
		createComponent<React.FC>();
		createComponent<React.FC<T>>();
		createComponent<React.VoidFunctionComponent>();
		createComponent<React.VoidFunctionComponent<T>>();"
	`);
});
