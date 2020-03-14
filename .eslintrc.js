module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "import/extensions": ["error", "ignorePackages"],
    'no-console': ["warn", { allow: ["warn", "error"] }] ,
    'no-unused-vars': ["warn"]
  },
};
