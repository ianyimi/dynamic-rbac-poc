// @ts-check

/** @type {import('prettier').Config} */
const config = {
  // Base formatting
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // Plugins
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss', // Must be last!
  ],

  // Import sorting configuration (T3-inspired)
  importOrder: [
    '^(react/(.*)$)|^(react$)', // React first
    '^(next/(.*)$)|^(next$)', // Next.js second (if used)
    '<THIRD_PARTY_MODULES>', // Third-party packages
    '',
    '^@/(.*)$', // Absolute imports with @
    '^~/(.*)$', // Absolute imports with ~
    '',
    '^[../]', // Parent imports
    '^[./]', // Relative imports
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
}

export default config
