module.exports = {
    parser: "@typescript-eslint/parser",
    settings: {
        react: {
            version: 'detect'
        }
    },
    parserOptions: {
        project: './tsconfig.json'
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off'
    }
};
