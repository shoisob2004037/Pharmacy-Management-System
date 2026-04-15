/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Blue – used for headers, links, main buttons, borders
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // main primary color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Success / Accent Green – used for "Add Medicine", "Save", "Sell" buttons
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // main success color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        // Danger / Delete – soft red (optional, if you want delete buttons)
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        }
      }
    },
  },
  plugins: [],
}