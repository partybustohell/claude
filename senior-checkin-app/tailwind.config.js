/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // High contrast, accessible color palette
        'safe-green': {
          50: '#e8f5ea',
          100: '#c8e6c9',
          500: '#2e7d32',
          600: '#1a5f2a',
          700: '#166534',
          800: '#145028',
          900: '#0d3d1c',
        },
        'alert-amber': {
          50: '#fff8e1',
          100: '#ffecb3',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        'danger-red': {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
        },
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          500: '#737373',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        }
      },
      fontFamily: {
        'primary': ['Noto Sans', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Extra large sizes for senior accessibility
        'senior-sm': ['1.25rem', { lineHeight: '1.75rem' }],
        'senior-base': ['1.5rem', { lineHeight: '2rem' }],
        'senior-lg': ['2rem', { lineHeight: '2.5rem' }],
        'senior-xl': ['2.5rem', { lineHeight: '3rem' }],
        'senior-2xl': ['3rem', { lineHeight: '3.5rem' }],
        'senior-3xl': ['4rem', { lineHeight: '4.5rem' }],
      },
      spacing: {
        'touch-min': '48px',
        'touch-lg': '64px',
        'touch-xl': '80px',
      },
      borderRadius: {
        'senior': '16px',
      },
      boxShadow: {
        'senior': '0 4px 14px rgba(0, 0, 0, 0.1)',
        'senior-lg': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'senior-pressed': 'inset 0 4px 8px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
