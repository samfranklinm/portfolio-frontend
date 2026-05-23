const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       'var(--color-bg)',
        surface:  'var(--color-bg-surface)',
        elevated: 'var(--color-bg-elevated)',
        border:   'var(--color-border)',
        accent:   'var(--color-accent)',
        primary:  'var(--color-text-primary)',
        muted:    'var(--color-text-muted)',
        faint:    'var(--color-text-faint)',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
