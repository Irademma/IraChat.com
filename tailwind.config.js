/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./App.{js,jsx,ts,tsx}",
      "./app/**/*.{js,jsx,ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}",
      "./hooks/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A',
          },
          secondary: {
            50: '#F0F4FF',
            100: '#E0E7FF',
            200: '#C7D2FE',
            300: '#A5B4FC',
            400: '#818CF8',
            500: '#667eea',
            600: '#5B6CE8',
            700: '#4F46E5',
            800: '#4338CA',
            900: '#3730A3',
          },
          accent: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
          chat: {
            'bubble-own': '#3B82F6',
            'bubble-other': '#F3F4F6',
            'text-own': '#FFFFFF',
            'text-other': '#111827',
          }
        },
        fontFamily: {
          'sans': ['System', 'ui-sans-serif', 'system-ui'],
          'system': ['System'],
        },
        fontWeight: {
          'thin': '100',
          'extralight': '200',
          'light': '300',
          'normal': '400',
          'medium': '500',
          'semibold': '600',
          'bold': '700',
          'extrabold': '800',
          'black': '900',
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
        },
        animation: {
          // All animations disabled
        },
        keyframes: {
          // All keyframes disabled
        },
      },
    },
    plugins: [],
  };
  