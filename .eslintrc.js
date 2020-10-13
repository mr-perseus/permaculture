module.exports = {
    extends: [
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:eslint-comments/recommended',
        'plugin:promise/recommended',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'prettier',
        'prettier/react',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
        'plugin:security/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    env: {
        browser: true,
        es6: true,
    },
    plugins: [
        'react',
        'react-hooks',
        '@typescript-eslint',
        'prettier',
        'import',
        'promise',
        'jest',
        'security',
        'no-secrets',
    ],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
    rules: {
        'prettier/prettier': ['warn'],
        'no-secrets/no-secrets': 'error',
        'import/no-unresolved': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        'class-methods-use-this': 'off',
    },
};
