const mystTheme = require('@myst-theme/styles');

// As in themes/lecture: @myst-theme/styles' globs assume a node_modules beside
// the theme, but the workspace hoists dependencies to the repository root.
const content = [
  ...mystTheme.content.map((glob) =>
    glob.startsWith('node_modules/') ? `../../${glob}` : glob,
  ),
  '../../packages/common/**/*.{ts,tsx}',
];

module.exports = {
  darkMode: 'class',
  content,
  theme: {
    extend: {
      ...mystTheme.themeExtensions,
      // The shared components (packages/common: Search, Tooltip,
      // LanguageSwitcher) are written against the lecture palette's names.
      // Until they take tokens, the book maps those names onto its own.
      colors: {
        'qepage-dark': 'var(--qb-paper-2)',
        'qetoolbar-light': 'var(--qb-paper-2)',
        'qetoolbar-dark': 'var(--qb-paper-3)',
        'qetoolbar-border': 'var(--qb-rule)',
        'qetext-light': 'var(--qb-ink-soft)',
        'qetext-dark': 'var(--qb-ink)',
        'qetext-dark-muted': 'var(--qb-muted)',
        'qeborder-blue': 'var(--qb-blue)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  safelist: mystTheme.safeList,
};
