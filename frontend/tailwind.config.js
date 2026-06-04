/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f172a',
          muted: '#334155',
          accent: '#1e40af',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          sidebar: '#ffffff',
          border: '#e2e8f0',
          text: '#0f172a',
          subtext: '#64748b',
        },
        brand: {
          DEFAULT: '#1e40af',
          hover: '#1d4ed8',
          light: '#eff6ff',
          soft: '#dbeafe',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        cardHover: '0 4px 12px rgba(15, 23, 42, 0.08)',
        elevated: '0 8px 24px rgba(15, 23, 42, 0.1)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
      },
    },
  },
  plugins: [],
};
