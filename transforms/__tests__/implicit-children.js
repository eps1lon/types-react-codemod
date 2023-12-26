const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const implicitChildrenTransform = require("../implicit-children");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		implicitChildrenTransform,
		options,
		{
			path: "test.d.ts",
			source: dedent(source),
		},
	);
}

describe("transform implicit-children", () => {
	test("FC", () => {
		expect(
			applyTransform(`
        const A: React.FC<{}>;
    `),
		).toMatchInlineSnapshot(
			`"const A: React.FC<React.PropsWithChildren<{}>>;"`,
		);
	});

	test("SFC", () => {
		expect(
			applyTransform(`
      const A: React.SFC<{}>;
    `),
		).toMatchInlineSnapshot(
			`"const A: React.SFC<React.PropsWithChildren<{}>>;"`,
		);
	});

	test("StatelessComponent", () => {
		expect(
			applyTransform(`
      const A: React.StatelessComponent<{}>;
    `),
		).toMatchInlineSnapshot(
			`"const A: React.StatelessComponent<React.PropsWithChildren<{}>>;"`,
		);
	});

	test("ComponentType", () => {
		expect(
			applyTransform(`
      const A: React.ComponentType<{}>;
    `),
		).toMatchInlineSnapshot(
			`"const A: React.ComponentType<React.PropsWithChildren<{}>>;"`,
		);
	});

	test("without type parameter list", () => {
		expect(
			applyTransform(`
        const A: React.FunctionComponent;
    `),
		).toMatchInlineSnapshot(
			`"const A: React.FunctionComponent<React.PropsWithChildren<unknown>>;"`,
		);
	});

	test("with type parameter list", () => {
		expect(
			applyTransform(`
        const A: FunctionComponent<unknown>;
    `),
		).toMatchInlineSnapshot(
			`"const A: FunctionComponent<React.PropsWithChildren<unknown>>;"`,
		);
	});

	test("with (extraneous) type parameters", () => {
		expect(
			applyTransform(`
        const A: FunctionComponent<Props, B>;
    `),
		).toMatchInlineSnapshot(
			`"const A: FunctionComponent<React.PropsWithChildren<Props>, B>;"`,
		);
	});

	test("with complex props type", () => {
		expect(
			applyTransform(`
        const A: React.FunctionComponent<Props & OtherProps>;;
    `),
		).toMatchInlineSnapshot(
			`"const A: React.FunctionComponent<React.PropsWithChildren<Props & OtherProps>>;;"`,
		);
	});

	test("false-positive double wrapping", () => {
		expect(
			applyTransform(`
        const A: FunctionComponent<React.PropsWithChildren<unknown>, {}>;
    `),
		).toMatchInlineSnapshot(
			`"const A: FunctionComponent<React.PropsWithChildren<React.PropsWithChildren<unknown>>, {}>;"`,
		);
	});

	test("noop", () => {
		expect(
			applyTransform(`
        const A: React.JSXElementConstructor;
    `),
		).toMatchInlineSnapshot(`"const A: React.JSXElementConstructor;"`);
	});
});
