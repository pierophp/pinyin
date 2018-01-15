module.exports = {
  root: true,
  // parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: ['node'],
  // add your custom rules here
  rules: {
    //'import/no-unresolved': 0,
    'no-continue': 0,
    'no-param-reassign': 0,
    'arrow-body-style': 0,
    'arrow-parens': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
  },
};
