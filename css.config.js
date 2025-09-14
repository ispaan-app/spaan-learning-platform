module.exports = {
  plugins: {
    'stylelint': {},
    'postcss-import': {},
    'tailwindcss': {},
    'autoprefixer': {},
  },
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'variants',
          'responsive',
          'screen'
        ]
      }
    ]
  }
}
