/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1a1f',
          light: '#25252d',
          dark: '#0c0c0f',
          card: '#1e1e26',
        },
        accent: {
          DEFAULT: '#10b981',
          hover: '#059669',
          cyan: '#22d3ee',
          violet: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(16, 185, 129, 0.15)',
        'glow-sm': '0 0 20px rgba(34, 211, 238, 0.2)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #10b981 0%, #22d3ee 50%, #8b5cf6 100%)',
        'gradient-user': 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
        'gradient-ai': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      },
    },
  },
  plugins: [],
};
