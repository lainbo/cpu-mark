module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/base',
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/prettier',
    './.eslintrc-auto-import.json'
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'vue/script-setup-uses-vars': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
        semi: false,
        trailingComma: 'es5',
      },
    ],
  },
}
