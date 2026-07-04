/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FFFFFF',
        accent: '#2563EB',
        'accent-soft': 'rgba(37, 99, 235, 0.12)',
        ink: '#111111',
        muted: '#666666',
        hairline: 'rgba(17, 17, 17, 0.08)',
      },
      fontFamily: {
        display: [
          'SF Pro Display',
          '"Neue Montreal"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        sans: [
          'Inter',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      fontSize: {
        // Fluid, cinematic type scale
        'display-xl': ['clamp(3.5rem, 12vw, 12rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'display-lg': ['clamp(2.75rem, 8vw, 7.5rem)', { lineHeight: '0.95', letterSpacing: '-0.035em' }],
        'display-md': ['clamp(2.25rem, 5.5vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-sm': ['clamp(1.75rem, 3.5vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        eyebrow: '0.28em',
      },
      transitionTimingFunction: {
        // Apple-grade premium easing — no bounce, no elastic
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'premium-in': 'cubic-bezier(0.64, 0, 0.78, 0)',
      },
      backdropBlur: {
        glass: '20px',
      },
      maxWidth: {
        shell: '1600px',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.92' },
          '50%': { transform: 'scale(1.035)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.5' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'scroll-dot': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '35%': { opacity: '1' },
          '70%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        breathe: 'breathe 6s cubic-bezier(0.45, 0, 0.55, 1) infinite',
        'pulse-ring': 'pulse-ring 3.5s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        shimmer: 'shimmer 2.4s ease-in-out infinite',
        'scroll-dot': 'scroll-dot 2s cubic-bezier(0.45, 0, 0.55, 1) infinite',
      },
    },
  },
  plugins: [],
};
