module.exports = {
    root: true,
    extends: [
        'eslint:recommended'
    ],
    env: {
        node: true,
        es2022: true
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    rules: {
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error'
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
        '*.config.js',
        '*.config.ts',
        'apps/web/'
    ]
};
