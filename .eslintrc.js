module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    jest: true,
  },
  rules: {
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-bitwise': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    curly: 'warn',
    radix: 'warn',
  },
};
