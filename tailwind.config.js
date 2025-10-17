/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        accent: '#1DCD9F',
        accentAlt: '#10B981',
        mint: {
          400: '#1DCD9F',
          500: '#1DCD9F',
          600: '#10B981',
          700: '#059669',
        },
        charcoal: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#2a2a2a',
        },
        gray: {
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
        },
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        clash: ['Clash Display', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.5', textShadow: '0 0 20px rgba(29, 205, 159, 0.5)' },
          '100%': { opacity: '1', textShadow: '0 0 40px rgba(29, 205, 159, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}

