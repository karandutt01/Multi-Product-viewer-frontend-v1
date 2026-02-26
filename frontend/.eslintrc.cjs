/* ESLint config for React + TypeScript + Testing Library + Prettier */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    // Enable type-aware lint rules; if you don't want type-aware checks, remove "project" and
    // drop "plugin:@typescript-eslint/recommended-requiring-type-checking" from "extends".
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {}, // pick up TypeScript path aliases if any
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'testing-library',
    'jest-dom',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Type-aware rules (requires parserOptions.project)
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
    // Keep Prettier last to disable stylistic ESLint rules it covers
    'plugin:prettier/recommended',
  ],
  rules: {
    // Formatting via Prettier; fail CI on formatting drift
    'prettier/prettier': ['error'],

    // React modern JSX transform
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // General quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always'],

    // Import hygiene / consistency
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // TS best practices
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // Allow void-return event handlers (common in React onClick)
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],

    // Testing library guardrails
    'testing-library/no-debugging-utils': 'warn',
    'testing-library/no-await-sync-events': 'warn',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.{ts,tsx,js,jsx}', '**/*.{spec,test}.{ts,tsx,js,jsx}'],
      env: { jest: true },
      rules: {
        // Loosen some type-unsafe rules in tests for pragmatism with mocks
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['*.js', '*.cjs'],
      // Use default parser for plain JS config files
      parser: undefined,
    },
  ],
  ignorePatterns: [
    // Build/output/cache
    'dist/',
    'build/',
    'coverage/',
    'node_modules/',
    // Static assets/public
    'public/',
    // Minified or vendored
    '*.min.js',
  ],
};