/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f4f6fb',
          sidebar: '#f8f9fc',
          border: '#e8ecf4',
          text: '#1e293b',
          subtext: '#64748b',
        },
        brand: {
          DEFAULT: '#5b4cdb',
          hover: '#4a3bc9',
          light: '#eef0ff',
          soft: '#c7d2fe',
        },
        accent: {
          DEFAULT: '#5b4cdb',
          hover: '#4a3bc9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(91, 76, 219, 0.08)',
        cardHover: '0 8px 32px rgba(91, 76, 219, 0.14)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6d5ce8 0%, #5b4cdb 50%, #7c6df0 100%)',
        'page-bg': 'linear-gradient(180deg, #f8f9fc 0%, #eef1f8 100%)',
      },
    },
  },
  plugins: [],
};
