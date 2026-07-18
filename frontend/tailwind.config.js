/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#0B57D0',
          DEFAULT: '#0B57D0',
          dark: '#A8C7FA',
        },
        secondary: {
          light: '#5F6368',
          DEFAULT: '#5F6368',
          dark: '#C4C7C5',
        },
        success: {
          light: '#137333',
          DEFAULT: '#137333',
          dark: '#81C995',
        },
        warning: {
          light: '#B06000',
          DEFAULT: '#B06000',
          dark: '#FDD663',
        },
        danger: {
          light: '#C5221F',
          DEFAULT: '#C5221F',
          dark: '#F28B82',
        },
        background: {
          light: '#F8FAFC',
          DEFAULT: '#F8FAFC',
          dark: '#0B0F19',
        },
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#FFFFFF',
          dark: '#151F32',
        },
        border: {
          light: '#DADCE0',
          DEFAULT: '#DADCE0',
          dark: '#24334C',
        },
        text: {
          light: '#1F2023',
          DEFAULT: '#1F2023',
          dark: '#E3E3E3',
        },
        subText: {
          light: '#5F6368',
          DEFAULT: '#5F6368',
          dark: '#C4C7C5',
        },
        primaryContainer: {
          light: '#D3E3FD',
          DEFAULT: '#D3E3FD',
          dark: '#0842A0',
        },
        onPrimaryContainer: {
          light: '#041E49',
          DEFAULT: '#041E49',
          dark: '#D3E3FD',
        },
      },
    },
  },
  plugins: [],
}
