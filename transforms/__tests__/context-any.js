import { describe, expect, test } from "@jest/globals";
import dedent from "dedent";
import * as JscodeshiftTestUtils from "jscodeshift/dist/testUtils";
import contextAnyTransform from "../context-any";

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(contextAnyTransform, options, {
		path: "test.d.ts",
		source: dedent(source),
	});
}

describe("transform context-any", () => {
	test("empty component", () => {
		expect(
			applyTransform(`
        class A extends React.Component {}
    `)
		).toMatchInlineSnapshot(`"class A extends React.Component {}"`);
	});

	test("empty pure component", () => {
		expect(
			applyTransform(`
        class A extends React.PureComponent {}
    `)
		).toMatchInlineSnapshot(`"class A extends React.PureComponent {}"`);
	});

	test("existing type declaration", () => {
		expect(
			applyTransform(`
        class A extends React.Component {
          context: any
          render() {
            return this.context.value;
          }
        }
    `)
		).toMatchInlineSnapshot(`
		"class A extends React.Component {
		  context: any
		  render() {
		    return this.context.value;
		  }
		}"
	`);
	});

	test("missing type declaration named import", () => {
		expect(
			applyTransform(`
        class A extends PureComponent {
          render() {
            return this.context.value;
          }
        }
    `)
		).toMatchInlineSnapshot(`
		"class A extends PureComponent {
		  context: any;
		  render() {
		    return this.context.value;
		  }
		}"
	`);
	});

	test("missing type declaration namespace import", () => {
		expect(
			applyTransform(`
        class A extends React.Component {
          render() {
            return this.context.value;
          }
        }
    `)
		).toMatchInlineSnapshot(`
		"class A extends React.Component {
		  context: any;
		  render() {
		    return this.context.value;
		  }
		}"
	`);
	});

	test("false-negative on class inheritance", () => {
		expect(
			applyTransform(`
        class A extends React.Component {}
        class B extends A {
          render() {
            return this.context.value;
          }
        }
    `)
		).toMatchInlineSnapshot(`
		"class A extends React.Component {}
		class B extends A {
		  render() {
		    return this.context.value;
		  }
		}"
	`);
	});

	test("no crash when top class", () => {
		expect(
			applyTransform(`
			class Component {
				render() {
					return this.context.value;
				}
			}
		`)
		).toMatchInlineSnapshot(`
		"class Component {
						render() {
							return this.context.value;
						}
					}"
	`);
	});
});
