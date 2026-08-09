import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Both build outputs: `dist` is the browser bundle, `dist-ssr` the build-time
  // renderer (see vite.config.js). Without dist-ssr here, `npm run lint` walks
  // the generated bundles and reports dozens of failures in machine-written code.
  globalIgnores(['dist', 'dist-ssr']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Build scripts run in Node, not the browser. Without this they were linted
  // against browser globals, so any use of `process` (argv, exit, env) read as
  // an undefined variable — which is why no script had used one until now.
  {
    files: ['scripts/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
])
