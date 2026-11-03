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
          500: 'hsl(var(--primary))',
          600: 'hsl(var(--primary) / 0.9)',
          DEFAULT: 'hsl(var(--primary))',
        },
        'bolt-orange': 'hsl(var(--primary))',
        'deep-abyss': 'hsl(var(--background))',
        'steel-grey': 'hsl(var(--surface))',
        surface: 'hsl(var(--surface))',
        'neon-lime': 'hsl(var(--accent))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        card: 'hsla(var(--card))',
        border: 'hsla(var(--border))',
      },
      fontFamily: {
        industrial: ['"Inter Tight"', 'sans-serif'],
        precision: ['"JetBrains Mono"', 'monospace'],
        tight: ['"Inter Tight"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        // Tema único: nada pasa de 20px (paneles); tarjetas 12–16.
        '3xl': '1.25rem',
        '4xl': '1.25rem',
        '5xl': '1.25rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
