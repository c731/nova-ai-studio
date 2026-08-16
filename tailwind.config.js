/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07070d',
          900: '#0c0c18',
          800: '#12122a',
          700: '#1a1a38',
        },
        brand: {
          violet: '#8b7cf6',
          cyan: '#22d3ee',
          pink: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'PingFang SC', 'Noto Sans SC', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 32px rgba(0,0,0,0.3)',
        glow: '0 0 40px rgba(139,124,246,0.18)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(-16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both',
        fadeIn: 'fadeIn 0.35s ease both',
        toastIn: 'toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
      },
    },
  },
  plugins: [],
};
