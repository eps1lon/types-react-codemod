const { describe, expect, test } = require("@jest/globals");
const parseSync = require("../parseSync");

describe("parseSync", () => {
	test("oldschool type casts in ts files", () => {
		expect(() =>
			parseSync({
				// based on https://github.com/DefinitelyTyped/DefinitelyTyped/blob/3eacc5e0b7c56d2670a5a0e68735f7638e8f38f3/types/chai-like/chai-like-tests.ts
				path: "test.ts",
				source: `(<RegExp> expected).test(object);`,
			}),
		).not.toThrow();
	});

	test("TSInstantiationExpression", () => {
		expect(() =>
			parseSync({
				path: "test.ts",
				source: `const makeStringBox = makeBox<string>;`,
			}),
		).not.toThrow();
	});
});
