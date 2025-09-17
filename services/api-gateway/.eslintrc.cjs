module.exports = {
    extends: ['@typescript-eslint/recommended'],
    plugins: ['boundaries'],
    settings: {
        'boundaries/elements': [
            { type: 'module', pattern: 'src/modules/*' },
            { type: 'shared', pattern: 'src/shared/**' }
        ]
    },
    rules: {
        'boundaries/element-types': [2, {
            default: 'disallow',
            rules: [
                { from: ['module'], to: ['shared'] },
                { from: ['module'], to: ['module'], disallow: ['deep'] } // only via each module's index.ts
            ]
        }]
    }
}
