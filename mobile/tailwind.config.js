/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        card: '#18181B',
        border: '#27272A',
        primary: '#8B5CF6',
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        muted: '#A1A1AA',
      },
      fontFamily: {
        // Configuraremos fontes personalizadas depois (ex: Inter ou Poppins)
        sans: ['Inter', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}