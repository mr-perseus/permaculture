module.exports = {
    extends: [
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
        'plugin:security/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'prettier', 'security', 'no-secrets'],
    rules: {
        'prettier/prettier': ['warn'],
        'react/jsx-indent': ['warn', 4],
        'react/jsx-indent-props': ['warn', 4],
        'react/jsx-one-expression-per-line': 'off',

        // See https://github.com/nickdeis/eslint-plugin-no-secrets
        'no-secrets/no-secrets': 'error',

        // TODO re-enable this rule
        'no-console': 'off',
    },
};
