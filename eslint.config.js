const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    ignores: ['.angular/cache/**', 'dist/**', 'node_modules/**'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      prettierConfig, // disables conflicting ESLint rules
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'off',
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      'no-useless-constructor': 'off',
    },
  },
  {
    files: ['**/*.html'],
    ignores: ['.angular/cache/**', 'dist/**', 'node_modules/**'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
]);
