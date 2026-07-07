/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    './.eslintrc-auto-import.json',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // ============ Vue ============
    'vue/multi-word-component-names': 'off', // 允许单词组件名（如 Login.vue）
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/define-macros-order': [
      'error',
      { order: ['defineProps', 'defineEmits'] },
    ],
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    // ============ TypeScript ============
    '@typescript-eslint/no-explicit-any': 'warn', // 警告但不报错（业务里有时需要 any）
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    // ============ 通用 ============
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': 'error',
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js', 'src/types/*.d.ts'],
}
