 
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            'primary': '#1a202c', // a dark gray
            'secondary': '#2d3748', // a slightly lighter dark gray
            'accent': '#4299e1', // a nice blue
            'text-primary': '#edf2f7',
            'text-secondary': '#a0aec0',
        }
    },
  },
  plugins: [],
}