module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    'plugin:vue/base',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/prettier',
    './.eslintrc-auto-import.json'
  ],
  rules: {
    'vue/custom-event-name-casing': [2, 'camelCase'], // vue的自定义事件名必须是小驼峰
    'no-floating-decimal': 2, // 禁止省略浮点数中的0，(比如const num = .5)
    eqeqeq: ['error', 'always'], // 强制在任何情况下都使用 === 和 !==
    // 注释文字前面至少要有一个空格
    'spaced-comment': [
      1,
      'always',
      {
        line: { markers: ['/'], exceptions: ['-', '+'] },
        block: { markers: ['!'], exceptions: ['*'], balanced: true }
      }
    ],
    'prettier/prettier': [
      'warn',
      {
        useTabs: false, // 使用空格代替tab缩进
        singleQuote: true, // 单引号true
        tabWidth: 2, // 缩进2空格
        semi: false, // 分号false
        arrowParens: 'avoid', // 箭头函数的参数能不加括号就不加
        printWidth: 90, // 超过90折行
        endOfLine: 'lf', // 行尾lf
        trailingComma: 'es5', // 在对象或数组最后一个元素后面是否加逗号（'es5'会加尾逗号）
        quoteProps: 'consistent', // 如果对象中有一个属性需要引号，那所有的都给他加上，以免一个对象的一堆属性，有的带引号有的不带
        htmlWhitespaceSensitivity: 'strict' // 所有标签周围的空格（或缺少空格）被认为是重要的
      }
    ]
  }
}
