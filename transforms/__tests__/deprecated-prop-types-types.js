const { describe, expect, test } = require("@jest/globals");
const dedent = require("dedent");
const JscodeshiftTestUtils = require("jscodeshift/dist/testUtils");
const deprecatedPropTypesTypesTransform = require("../deprecated-prop-types-types");

function applyTransform(source, options = {}) {
	return JscodeshiftTestUtils.applyTransform(
		deprecatedPropTypesTypesTransform,
		options,
		{
			path: "test.tsx",
			source: dedent(source),
		},
	);
}

describe("transform deprecated-prop-types-types", () => {
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

	test("no import yet", () => {
		expect(
			applyTransform(`
				import * as React from 'react';
				declare const requireable: React.Requireable<React.ReactNode>;
				declare const validator: React.Validator<React.ReactNode>;
				declare const validationMap: React.ValidationMap<{}>;
				declare const weakValidationMap: React.WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import type * as PropTypes from "prop-types";
		import * as React from 'react';
		declare const requireable: PropTypes.Requireable<React.ReactNode>;
		declare const validator: PropTypes.Validator<React.ReactNode>;
		declare const validationMap: PropTypes.ValidationMap<{}>;
		declare const weakValidationMap: PropTypes.WeakValidationMap<{}>;"
	`);
	});

	test("existing default import", () => {
		expect(
			applyTransform(`
        import MyPropTypes from 'prop-types';
				import React from 'react';
				
				declare const requireable: React.Requireable<React.ReactNode>;
				declare const validator: React.Validator<React.ReactNode>;
				declare const validationMap: React.ValidationMap<{}>;
				declare const weakValidationMap: React.WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import MyPropTypes from 'prop-types';
		import React from 'react';

		declare const requireable: MyPropTypes.Requireable<React.ReactNode>;
		declare const validator: MyPropTypes.Validator<React.ReactNode>;
		declare const validationMap: MyPropTypes.ValidationMap<{}>;
		declare const weakValidationMap: MyPropTypes.WeakValidationMap<{}>;"
	`);
	});

	test("existing type default import", () => {
		expect(
			applyTransform(`
        import type MyPropTypes from 'prop-types';
        import type React from 'react';
        
        declare const requireable: React.Requireable<React.ReactNode>;
        declare const validator: React.Validator<React.ReactNode>;
        declare const validationMap: React.ValidationMap<{}>;
        declare const weakValidationMap: React.WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import type MyPropTypes from 'prop-types';
		import type React from 'react';

		declare const requireable: MyPropTypes.Requireable<React.ReactNode>;
		declare const validator: MyPropTypes.Validator<React.ReactNode>;
		declare const validationMap: MyPropTypes.ValidationMap<{}>;
		declare const weakValidationMap: MyPropTypes.WeakValidationMap<{}>;"
	`);
	});

	test("existing namespace import", () => {
		expect(
			applyTransform(`
        import * as MyPropTypes from 'prop-types';
        import * as React from 'react';
        
        declare const requireable: React.Requireable<React.ReactNode>;
        declare const validator: React.Validator<React.ReactNode>;
        declare const validationMap: React.ValidationMap<{}>;
        declare const weakValidationMap: React.WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import * as MyPropTypes from 'prop-types';
		import * as React from 'react';

		declare const requireable: MyPropTypes.Requireable<React.ReactNode>;
		declare const validator: MyPropTypes.Validator<React.ReactNode>;
		declare const validationMap: MyPropTypes.ValidationMap<{}>;
		declare const weakValidationMap: MyPropTypes.WeakValidationMap<{}>;"
	`);
	});

	test("existing type namespace import", () => {
		expect(
			applyTransform(`
        import type * as MyPropTypes from 'prop-types';
        import type * as React from 'react';
        
        declare const requireable: React.Requireable<React.ReactNode>;
        declare const validator: React.Validator<React.ReactNode>;
        declare const validationMap: React.ValidationMap<{}>;
        declare const weakValidationMap: React.WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import type * as MyPropTypes from 'prop-types';
		import type * as React from 'react';

		declare const requireable: MyPropTypes.Requireable<React.ReactNode>;
		declare const validator: MyPropTypes.Validator<React.ReactNode>;
		declare const validationMap: MyPropTypes.ValidationMap<{}>;
		declare const weakValidationMap: MyPropTypes.WeakValidationMap<{}>;"
	`);
	});

	test("existing named import with other named imports", () => {
		expect(
			applyTransform(`
        import { checkPropTypes, Validator as MyValidator } from 'prop-types';
        import { ReactNode, Requireable, Validator, ValidationMap, WeakValidationMap } from 'react';
        
        declare const requireable: Requireable<ReactNode>;
        declare const validator: Validator<ReactNode>;
        declare const validationMap: ValidationMap<{}>;
        declare const weakValidationMap: WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import {
		  checkPropTypes,
		  Validator as MyValidator,
		  type Requireable,
		  type ValidationMap,
		  type WeakValidationMap,
		} from 'prop-types';
		import { ReactNode } from 'react';

		declare const requireable: Requireable<ReactNode>;
		declare const validator: MyValidator<ReactNode>;
		declare const validationMap: ValidationMap<{}>;
		declare const weakValidationMap: WeakValidationMap<{}>;"
	`);
	});

	test("existing named import with other named type imports", () => {
		expect(
			applyTransform(`
        import { checkPropTypes, type Requireable as MyRequireable} from 'prop-types';
        import { type ReactNode, type Requireable, type Validator, type ValidationMap, type WeakValidationMap } from 'react';
        
        declare const requireable: Requireable<ReactNode>;
        declare const validator: Validator<ReactNode>;
        declare const validationMap: ValidationMap<{}>;
        declare const weakValidationMap: WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import {
		  checkPropTypes,
		  type Requireable as MyRequireable,
		  type Validator,
		  type ValidationMap,
		  type WeakValidationMap,
		} from 'prop-types';
		import { type ReactNode } from 'react';

		declare const requireable: MyRequireable<ReactNode>;
		declare const validator: Validator<ReactNode>;
		declare const validationMap: ValidationMap<{}>;
		declare const weakValidationMap: WeakValidationMap<{}>;"
	`);
	});

	test("existing named import", () => {
		expect(
			applyTransform(`
        import { checkPropTypes, Requireable, Validator, ValidationMap, WeakValidationMap } from 'prop-types';
        import { type ReactNode } from 'react';
        
        declare const requireable: Requireable<ReactNode>;
        declare const validator: Validator<ReactNode>;
        declare const validationMap: ValidationMap<{}>;
        declare const weakValidationMap: WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import { checkPropTypes, Requireable, Validator, ValidationMap, WeakValidationMap } from 'prop-types';
		import { type ReactNode } from 'react';

		declare const requireable: Requireable<ReactNode>;
		declare const validator: Validator<ReactNode>;
		declare const validationMap: ValidationMap<{}>;
		declare const weakValidationMap: WeakValidationMap<{}>;"
	`);
	});

	test("existing namespace require", () => {
		expect(
			applyTransform(`
        const PropTypes = require('prop-types')
        const React = require('react');
        
        declare const requireable: React.Requireable<React.ReactNode>;
        declare const validator: React.Validator<React.ReactNode>;
        declare const validationMap: React.ValidationMap<{}>;
        declare const weakValidationMap: React.WeakValidationMap<{}>;
			`),
		).toMatchInlineSnapshot(`
		"import type * as PropTypes from "prop-types";
		const PropTypes = require('prop-types')
		const React = require('react');

		declare const requireable: PropTypes.Requireable<React.ReactNode>;
		declare const validator: PropTypes.Validator<React.ReactNode>;
		declare const validationMap: PropTypes.ValidationMap<{}>;
		declare const weakValidationMap: PropTypes.WeakValidationMap<{}>;"
	`);
	});

	test("insert position", () => {
		expect(
			applyTransform(`
        import * as React from 'react';
        import {} from '@testing-library/react'
        
        declare const requireable: React.Requireable<React.ReactNode>;
        declare const validator: React.Validator<React.ReactNode>;
        declare const validationMap: React.ValidationMap<{}>;
        declare const weakValidationMap: React.WeakValidationMap<{}>;

				declare const element: JSX.Element;
			`),
		).toMatchInlineSnapshot(`
		"import type * as PropTypes from "prop-types";
		import * as React from 'react';
		import {} from '@testing-library/react'

		declare const requireable: PropTypes.Requireable<React.ReactNode>;
		declare const validator: PropTypes.Validator<React.ReactNode>;
		declare const validationMap: PropTypes.ValidationMap<{}>;
		declare const weakValidationMap: PropTypes.WeakValidationMap<{}>;

		declare const element: JSX.Element;"
	`);
	});

	test("detects usage in type parameters", () => {
		expect(
			applyTransform(`
			import React from 'react'

			[].reduce<React.Validator>((acc, component, i) => {});
			[].reduce((acc, component, i) => {})
			`),
		).toMatchInlineSnapshot(`
		"import type * as PropTypes from "prop-types";
		import React from 'react'

		[].reduce<PropTypes.Validator>((acc, component, i) => {});
		[].reduce((acc, component, i) => {})"
	`);
	});
});
