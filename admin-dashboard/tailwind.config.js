/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#eff6ff',
          dark: '#1e40af',
        },
        sidebar: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
          active: '#0f172a',
          text: '#94a3b8',
          textActive: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          bg: '#f8fafc',
          border: '#e2e8f0',
          hover: '#f1f5f9',
        },
        text: {
          primary: '#0f172a',
          secondary: '#64748b',
          muted: '#94a3b8',
        },
        status: {
          successBg: '#ecfdf5',
          successText: '#065f46',
          successDot: '#10b981',
          warningBg: '#fffbeb',
          warningText: '#92400e',
          warningDot: '#f59e0b',
          dangerBg: '#fef2f2',
          dangerText: '#991b1b',
          dangerDot: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
