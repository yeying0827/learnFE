module.exports = {
	env: {
		jest: true,
		browser: true,
		es2021: true,
		node: true,
	},
	extends: 'xo',
	globals: {
		TestGlobalVariable: 'readonly'
	},
	overrides: [
		{
			extends: [
				'xo-typescript',
			],
			files: [
				'*.ts',
				'*.tsx',
			],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
	},
};
