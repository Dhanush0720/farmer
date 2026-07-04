/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          // Forest Greens
          green: {
            light: '#e8f5e9',
            medium: '#2e7d32',
            dark: '#1b5e20',
            DEFAULT: '#2e7d32'
          },
          // Rich Soils
          soil: {
            light: '#f5f5f5',
            medium: '#8d6e63',
            dark: '#4e342e',
            DEFAULT: '#4e342e'
          },
          // Warm Ambers
          amber: {
            light: '#fff8e1',
            medium: '#ffb300',
            dark: '#ff8f00',
            DEFAULT: '#ffb300'
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
