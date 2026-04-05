/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#FF4500', // Bolt Orange
          600: '#E63E00',
          DEFAULT: '#FF4500',
        },
        'bolt-orange': '#FF4500',
        'deep-abyss': '#0D0D0D',
        'steel-grey': '#1A1A1A',
        'neon-lime': '#CCFF00',
      },
      fontFamily: {
        industrial: ['"Inter Tight"', 'sans-serif'],
        precision: ['"JetBrains Mono"', 'monospace'],
        tight: ['"Inter Tight"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
