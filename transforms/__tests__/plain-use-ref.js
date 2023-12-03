const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const plainUseRefTransform = require("../plain-use-ref");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(plainUseRefTransform, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

describe("transform plain-use-refk", () => {
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
      import { useRef } from 'react';
      const myRef = useRef<T>();
      `),
		).toMatchInlineSnapshot(`
		"import { useRef } from 'react';
		const myRef = useRef<T>();"
	`);
	});

	test("false-negative named renamed import", () => {
		expect(
			applyTransform(`
      import { useRef as useMyRef } from 'react';
      const myRef = useMyRef<T>();
      `),
		).toMatchInlineSnapshot(`
		"import { RefObject as MyRefObject } from 'react';
		const myRef: MyRefObject<View> = createRef();"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
      import * as React from 'react';
      const myRef = React.useRef<T>();
      `),
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
		const myRef: React.RefObject<View | null> = createRef();"
	`);
	});
});
