export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b'
        },
        surface: '#f8fafc',
        muted: '#64748b'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif']
      }
    }
  },
  plugins: []
};
