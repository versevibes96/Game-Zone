// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        floatUp: 'floatUp 3s ease-in-out infinite',
        bounceSlow: 'bounceSlow 2.5s infinite',
        gradient: 'gradientBG 15s ease infinite',
        glowText: 'glowText 2s ease-in-out infinite',
      },
      keyframes: {
        floatUp: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        gradientBG: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glowText: {
          '0%, 100%': { textShadow: '0 0 10px #fff, 0 0 20px #0ff' },
          '50%': { textShadow: '0 0 20px #0ff, 0 0 30px #00f' },
        },
      },
    },
  },
  plugins: [],
};
