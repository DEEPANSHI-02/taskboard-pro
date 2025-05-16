// postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-nesting': {}, 
    '@tailwindcss/postcss': {}, // Changed from tailwindcss to @tailwindcss/postcss
    autoprefixer: {},
  },
};