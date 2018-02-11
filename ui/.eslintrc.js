module.exports = {
  root: true,
  env: {
    browser: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: ['html'],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      webpack: {
        config: 'build/webpack.base.conf.js',
      },
    },
  },
  // add your custom rules here
  rules: {
    // don't require .vue extension when importing
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        vue: 'never',
      },
    ],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,

    // disable the need of parens on single argument functions
    'arrow-parens': 0,
    // disable for vuex mutations
    'no-param-reassign': 0,
    // allow using this on classes
    'class-methods-use-this': 0,
    'no-restricted-syntax': 0,
    'no-await-in-loop': 0,
    'space-before-function-paren': 0,
    'wrap-iife': 0,
    'no-mixed-operators': 0
  },
  globals: {
    $: true,
    document: true,
    location: true,
    window: true,
    navigator: true,
  },
};
