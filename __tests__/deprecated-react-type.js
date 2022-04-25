import { describe, expect, test } from "@jest/globals";

describe("transform deprecated-react-type", () => {
	test("named import", () => {
		expect(`
      import { ReactType } from 'react';
      ReactType;
    `).toMatchInlineSnapshot(`
		"import { ElementType } from 'react';
		ElementTye;"
	`);
	});
});
