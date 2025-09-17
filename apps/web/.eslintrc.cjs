module.exports = {
    extends: ['next/core-web-vitals'],
    plugins: ['boundaries'],
    settings: {
        'boundaries/elements': [
            { type: 'feature', pattern: 'src/features/*' },
            { type: 'shared', pattern: 'src/shared/**' }
        ]
    },
    rules: {
        'boundaries/element-types': [2, {
            default: 'disallow',
            rules: [
                { from: ['feature'], to: ['feature', 'shared'] }, // allow feature->feature? set to shared-only if stricter
                { from: ['feature'], to: ['feature'], disallow: ['deep'] }, // prevent deep cross-imports
                { from: ['feature'], to: ['feature'], except: ['index.ts'] } // only via public index
            ]
        }]
    }
}
