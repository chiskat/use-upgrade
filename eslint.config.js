const js = require('@eslint/js')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals')
const tseslint = require('typescript-eslint')

module.exports = tseslint.config(
  { ignores: ['**/dist'] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['packages/*/{src,test}/**/*.ts', 'packages/*/*.{ts,mts,mjs,js}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node, ...globals.vitest },
    },
    plugins: {},
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  eslintPluginPrettierRecommended
)
