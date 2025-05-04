module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('@tailwindcss/postcss'), // Add this line
    require('autoprefixer'),
  ],
};