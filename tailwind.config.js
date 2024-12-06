// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        zenGray: '#f5f5f5',
        zenDark: '#333333',
        zenDarkText: '#f0f0f0',
        // Google colors and other colors if needed...
        'google-blue': '#4285F4',
        'google-gray': '#202124',
        'google-light-gray': '#F8F9FA',
        'google-dark-gray': '#5F6368',
        'google-white': '#FFFFFF',
        'google-black': '#000000',
        'google-red': '#EA4335',
        'google-yellow': '#FBBC05',
        'google-green': '#34A853',
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        serif: ['Lora', 'Serif'],
      },
    },
  },
  plugins: [],
};
