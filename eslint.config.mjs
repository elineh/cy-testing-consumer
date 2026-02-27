import js from '@eslint/js'
import { configs, parser } from 'typescript-eslint'
import { importX } from 'eslint-plugin-import-x'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import cypress from 'eslint-plugin-cypress'
import filenamesPlugin from 'eslint-plugin-filenames'
import implicitDependencies from 'eslint-plugin-implicit-dependencies'
import noOnlyTests from 'eslint-plugin-no-only-tests'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**']
  },
  js.configs.recommended,
  ...configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  cypress.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.es2021,
        ...globals.node
      },
      parser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.jest.json']
      }
    },
    plugins: {
      filenames: filenamesPlugin,
      'implicit-dependencies': implicitDependencies,
      'no-only-tests': noOnlyTests
    },
    settings: {
      'import-x/resolver': {
        typescript: {}
      }
    },
    files: ['**/!(*.*)'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      'no-only-tests/no-only-tests': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'filenames/match-regex': 'error',
      complexity: ['warn', 15],
      'object-curly-spacing': ['error', 'always'],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'import-x/default': 'off'
    }
  }
])
