import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import next from '@next/eslint-plugin-next';

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // Configuration for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      prettier: prettier,
      '@next/next': next
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // TypeScript recommended rules
      ...typescript.configs.recommended.rules,

      // Next.js recommended rules
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,

      // Prettier rules
      'prettier/prettier': 'error'
    }
  },

  // Ignore patterns (equivalent to .eslintignore)
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'dist/**']
  }
];
