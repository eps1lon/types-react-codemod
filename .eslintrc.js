module.exports = {
	env: {
		commonjs: true,
		es2021: true,
		node: true,
	},
	extends: "eslint:recommended",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "commonjs",
	},
	rules: {},
	overrides: [
		{
			files: "**/__tests__/**/*",
			parserOptions: {
				sourceType: "module",
			},
		},
		{
			files: "transforms/**/*",
			parserOptions: {
				sourceType: "module",
			},
		},
	],
};
