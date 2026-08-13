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
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: '#eff6ff',
          dark: '#1d4ed8',
        },
        sidebar: {
          DEFAULT: '#1e293b',
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
          primary: '#1e293b',
          secondary: '#64748b',
          muted: '#94a3b8',
        },
        status: {
          successBg: '#dcfce7',
          successText: '#166534',
          successDot: '#16a34a',
          warningBg: '#fef3c7',
          warningText: '#92400e',
          warningDot: '#f59e0b',
          dangerBg: '#fee2e2',
          dangerText: '#991b1b',
          dangerDot: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Inter', 'monospace'],
      },
      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '4px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
