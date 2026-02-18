import pluginJs from '@eslint/js';
import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Factory for project-specific ESLint overrides.
 * Keep the base deterministic to avoid lint drift across repositories.
 */
export function createEslintConfig(overrides = {}) {
  const baseRules = {
    'react/prop-types': 0,
    'react/display-name': 0,
    'prefer-template': 1,
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
  };

  return [
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    {
      languageOptions: {
        globals: globals.browser,
        parserOptions: {
          tsconfigRootDir: process.cwd(),
        },
      },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    pluginPrettierRecommended,
    {
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        ...baseRules,
        ...(overrides.rules || {}),
      },
    },
  ];
}

export default createEslintConfig();
