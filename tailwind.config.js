module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-facebook': '#1877F2',
        'brand-instagram': '#E4405F',
        'brand-linkedin': '#0A66C2',
        'brand-tiktok': '#000000',
        'brand-youtube': '#FF0000',
        'brand-snapchat': '#FFFC00',
        'brand-x': '#000000',
        'brand-pinterest': '#E60023',
        'brand-threads': '#000000',
        'brand-bluesky': '#0070ff',
      },
    },
  },
  plugins: [],
}; 