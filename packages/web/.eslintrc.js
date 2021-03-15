module.exports = {
  ignorePatterns: ['generated.tsx'],
  extends: [
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:jest/recommended',
    'prettier',
  ],
  plugins: [
    '@typescript-eslint',
    // 'jest'
  ],
  env: {
    browser: true,
    es6: true,
    // jest: true,
  },
  globals: {},
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    createDefaultProgram: true,
  },
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/prop-types': 0,
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          '{}': false,
        },
      },
    ],
    'import/order': [
      'warn',
      {
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '{common,@kathena,modules,utils,graphql}{/**,}',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'yup',
            message: 'Please use `@kathena/libs/yup` instead.',
          },
          {
            name: '@material-ui/core',
            importNames: ['Button', 'Typography', 'Alert', 'Link'],
            message: 'Please use customized components instead.',
          },
        ],
      },
    ],
    'import/prefer-default-export': 0,
    'react/require-default-props': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: ['*.tsx'],
      rules: {
        '@typescript-eslint/no-use-before-define': 0,
        'import/no-cycle': 0,
      },
    },
    {
      files: ['*.stories.tsx'],
      rules: {
        'react/jsx-props-no-spreading': 0,
      },
    },
  ],
}
