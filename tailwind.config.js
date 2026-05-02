/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./layouts/**/*.html",
      "./content/**/*.{html,md}"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            500: '#2563eb',
            600: '#1d4ed8',
            700: '#1e40af'
          },
          accent: {
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488'
          },
          ink: {
            900: '#07111f',
            800: '#0f1d2e',
            700: '#1d2d44'
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          heading: ['Plus Jakarta Sans', 'sans-serif'],
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
      require('@tailwindcss/typography'),
    ],
  }
