/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'oklch(98% 0.005 250)',
        'surface-alt': 'oklch(96% 0.008 250)',
        'surface-elevated': '#ffffff',
        fg: 'oklch(22% 0.02 250)',
        muted: 'oklch(55% 0.02 250)',
        'muted-light': 'oklch(75% 0.01 250)',
        border: 'oklch(88% 0.01 250)',
        accent: 'oklch(0.58 0.14 191)',
        'accent-fg': '#ffffff',
        'accent-muted': 'oklch(0.92 0.03 191)',
        success: 'oklch(0.55 0.12 155)',
        'success-muted': 'oklch(0.93 0.04 155)',
        warn: 'oklch(0.65 0.14 78)',
        'warn-muted': 'oklch(0.95 0.04 78)',
        danger: 'oklch(0.50 0.18 22)',
        'danger-muted': 'oklch(0.94 0.03 22)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
