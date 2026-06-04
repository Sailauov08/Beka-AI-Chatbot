/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#212121',
          light: '#2f2f2f',
          dark: '#171717',
        },
        accent: {
          DEFAULT: '#10a37f',
          hover: '#0d8c6d',
        },
      },
      fontFamily: {
        sans: ['Söhne', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
