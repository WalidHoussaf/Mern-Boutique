/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#015A89",
        secondary: "#77513B",
        accent: "#E1E8ED",
        dark: "#333333",
        light: "#FFFFFF",
        'primary-dark': "#014a71",
        'secondary-dark': "#654536"
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        prata: ["Prata", "serif"],
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out forwards',
        'fadeIn-fast': 'fadeIn 0.3s ease-in-out forwards',
        'fadeIn-slow': 'fadeIn 0.8s ease-in-out forwards',
        'spin-slow': 'spin 3s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        slideUp: 'slideUp 0.5s ease-in-out forwards',
        slideDown: 'slideDown 0.5s ease-in-out forwards',
        slideLeft: 'slideLeft 0.5s ease-in-out forwards',
        slideRight: 'slideRight 0.5s ease-in-out forwards',
        scaleIn: 'scaleIn 0.4s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px)' },
          '40%': { transform: 'translateX(10px)' },
          '60%': { transform: 'translateX(-7px)' },
          '80%': { transform: 'translateX(7px)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: 0, transform: 'translateX(20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'spacing': 'margin, padding',
      },
      boxShadow: {
        'inner-sm': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'inner-md': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-lg': 'inset 0 4px 6px 0 rgba(0, 0, 0, 0.07)',
      },
    },
  },
  plugins: [],
} 