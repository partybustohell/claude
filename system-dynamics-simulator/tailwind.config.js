/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise industrial palette
        surface: {
          base: '#f7f5f2',
          card: '#faf9f7',
          elevated: '#ffffff',
          border: '#e5e2dd',
        },
        ink: {
          900: '#1a1a1a',
          800: '#2d2d2d',
          700: '#404040',
          600: '#525252',
          500: '#6b6b6b',
          400: '#8a8a8a',
          300: '#a3a3a3',
          200: '#d4d4d4',
          100: '#e5e5e5',
        },
        status: {
          success: '#2d8a4e',
          'success-bg': '#e8f5ec',
          warning: '#b45309',
          'warning-bg': '#fef3e2',
          critical: '#b91c1c',
          'critical-bg': '#fde8e8',
          online: '#059669',
        },
        accent: {
          primary: '#1a1a1a',
          secondary: '#404040',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'kpi': ['2.5rem', { lineHeight: '1', fontWeight: '600' }],
        'label': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
      },
    },
  },
  plugins: [],
}
