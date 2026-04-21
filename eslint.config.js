import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

// Clean up globals by removing entries with whitespace
const cleanGlobals = Object.fromEntries(
  Object.entries(globals.browser).map(([key, value]) => [key.trim(), value]),
);

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: cleanGlobals,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react': react,
      'prettier': prettierPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
