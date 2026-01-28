export default {
  env: {
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "google"
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module"
  },
  rules: {
    "require-jsdoc": "off",
    "quotes": ["error", "double"],
    "no-unused-vars": "off"
  }
};
