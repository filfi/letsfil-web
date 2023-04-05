module.exports = {
  extends: require.resolve('@umijs/max/stylelint'),
  rules: {
    'function-no-unknown': null,
    'number-max-precision': [
      4,
      {
        ignoreUnits: ['em'],
        severity: 'warning',
      },
    ],
  },
};
