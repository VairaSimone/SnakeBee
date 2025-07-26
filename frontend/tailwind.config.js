/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: '#556B2F',
        forest: '#228B22',
        honey: '#FFD700',
        sand: '#EDE7D6',
        clay: '#FAF3E0',
        charcoal: '#2B2B2B',
        brick: '#CC3300',
        amber: '#FF9900',
        
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
plugins: [require('@tailwindcss/aspect-ratio')],
}
