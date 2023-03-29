const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const useRefRequiredInitial = require("../experimental-useRef-required-initial");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(useRefRequiredInitial, options, {
		path: "test.tsx",
		source: dedent(source),
	});
}

describe("transform useRef-required-initial", () => {
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
        import { useRef } from 'react';
				const myRef = useRef<number>();
      `)
		).toMatchInlineSnapshot(`
		"import { useRef } from 'react';
						const myRef = useRef<number>(undefined);"
	`);
	});

	test("false-negative named renamed import", () => {
		expect(
			applyTransform(`
        import { useRef as useReactRef } from 'react';
        const myRef = useReactRef<number>();
      `)
		).toMatchInlineSnapshot(`
		"import { useRef as useReactRef } from 'react';
		const myRef = useReactRef<number>();"
	`);
	});

	test("namespace import", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				const myRef = React.useRef<number>();
      `)
		).toMatchInlineSnapshot(`
		"import * as React from 'react';
						const myRef = React.useRef<number>(undefined);"
	`);
	});
});
