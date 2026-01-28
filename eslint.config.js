// @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // TanStack base config
  ...tanstackConfig,

  // React configuration
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Note: Tailwind class sorting handled by Prettier plugin
      // eslint-plugin-tailwindcss is incompatible with Tailwind v4

      // TypeScript rules (T3-inspired)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false, // Allow async form handlers
        },
      ],

      // Disable import sorting rules (handled by Prettier)
      'sort-imports': 'off',
      'import/order': 'off',
      'import/consistent-type-specifier-style': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      '.output/**',
      'node_modules/**',
      '.tanstack/**',
      '.nitro/**',
      'routeTree.gen.ts',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },
)
