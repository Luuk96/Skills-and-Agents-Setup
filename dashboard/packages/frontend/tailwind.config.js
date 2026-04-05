/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dashboard operator color palette — dark with bright status accents
        surface: {
          DEFAULT: '#0f1117',
          secondary: '#161b27',
          tertiary: '#1e2535',
          border: '#2a3347',
        },
        accent: {
          DEFAULT: '#3b82f6', // blue — primary actions
          green: '#22c55e',   // healthy / success
          yellow: '#eab308',  // warning / waiting
          red: '#ef4444',     // error / critical
          purple: '#a855f7',  // workflows
          cyan: '#06b6d4',    // skills / info
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
