module.exports = {
  extends: [
    'next/core-web-vitals'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    // Disable some strict rules that might cause build issues
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
};
