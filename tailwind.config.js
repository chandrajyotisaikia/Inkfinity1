/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          black: '#000000',
          charcoal: '#111111',
          panel: '#161616',
          line: '#262626',
        },
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#E9CE7A',
          dim: '#8A7226',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212,175,55,0.4), 0 8px 30px rgba(212,175,55,0.12)',
      },
    },
  },
  plugins: [],
}
