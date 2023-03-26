const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedReactChildTransform = require("../plain-refs");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedReactChildTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		}
	);
}

describe("transform plain-refs", () => {
	test("not modified", () => {
		expect(
			applyTransform(`
			import * as React from 'react';
			interface Props {
				children?: ReactNode;
			}
    `)
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
        import { RefObject } from 'react';
				const myRef: RefObject<View> = createRef();
      `)
		).toMatchInlineSnapshot(`
		"import { RefObject } from 'react';
						const myRef: RefObject<View | null> = createRef();"
	`);
	});

	test("false-negative named renamed import", () => {
		expect(
			applyTransform(`
				import { RefObject as MyRefObject } from 'react';
				const myRef: MyRefObject<View> = createRef();
      `)
		).toMatchInlineSnapshot(`
		"import { RefObject as MyRefObject } from 'react';
						const myRef: MyRefObject<View> = createRef();"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				const myRef: React.RefObject<View> = createRef();
      `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
						const myRef: React.RefObject<View | null> = createRef();"
	`);
	});

	test("unions", () => {
		expect(
			applyTransform(`
        import * as React from 'react';
				const myRef: React.RefObject<number | string> = createRef();
      `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
						const myRef: React.RefObject<number | string | null> = createRef();"
	`);
	});

	test("no change on apparent nullable", () => {
		expect(
			applyTransform(`
        import * as React from 'react';
				const myRef: React.RefObject<null | number> = createRef();
      `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
						const myRef: React.RefObject<null | number> = createRef();"
	`);
	});

	test("no change on apparent any", () => {
		expect(
			applyTransform(`
        import * as React from 'react';
				const anyRef: React.RefObject<any> = createRef();
				const stillAnyRef: React.RefObject<any | number> = createRef();
				type AnyAlias = any;
				const notApparentAny: React.RefObject<AnyAlias> = createRef();
      `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
						const anyRef: React.RefObject<any> = createRef();
						const stillAnyRef: React.RefObject<any | number> = createRef();
						type AnyAlias = any;
						const notApparentAny: React.RefObject<AnyAlias | null> = createRef();"
	`);
	});
});
