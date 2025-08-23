/** @type {import('tailwindcss').Config} */
export default {
  safelist: [
    'text-blue-500', 'hover:bg-blue-500/10',
    'text-amber', 'hover:bg-amber/10',
    'text-purple-500', 'hover:bg-purple-500/10',
    'text-brick', 'hover:bg-brick/10',
    'bg-forest', 'bg-amber', 'bg-blue-500', 'bg-purple-500',
  ],
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
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out'
      }
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio'),
  require('@tailwindcss/forms'),
  ],
}
