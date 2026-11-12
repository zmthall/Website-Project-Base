import withNuxt from './.nuxt/eslint.config.mjs';
export default withNuxt(
  {
    ignores: ['.output/**', 'test-results/**', 'playwright-report/**'],
  },
  {
    rules: {
      // Directory prefixes produce multiword Nuxt names (base/Button -> BaseButton).
      'vue/multi-word-component-names': 'off',
      // Optional props intentionally remain undefined; Prettier owns template formatting.
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['app/utils/media.ts', 'app/utils/navigation.ts'],
    // These guards intentionally reject control characters in untrusted URLs.
    rules: { 'no-control-regex': 'off' },
  },
);
