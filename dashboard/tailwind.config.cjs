/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base':      '#0A0A0F',
        'bg-surface':   '#0F0F1A',
        'bg-elevated':  '#16162A',
        'bg-overlay':   '#1C1C35',
        'purple': {
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
        },
        'pink': {
          400: '#2DD4BF',
          500: '#14B8A6',
        },
        'text-primary':   '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted':     '#475569',
        'success':        '#10B981',
        'warning':        '#F59E0B',
        'danger':         '#EF4444',
        'info':           '#3B82F6',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        ui:      ['Inter', 'sans-serif'],
        calligraphy: ['"Great Vibes"', 'cursive'],
        brand: ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
        'elevated': '0 4px 6px rgba(0,0,0,0.4), 0 16px 40px rgba(0,0,0,0.4)',
        'purple':   '0 0 0 1px rgba(59,130,246,0.5), 0 4px 20px rgba(59,130,246,0.25)',
        'pink':     '0 0 0 1px rgba(20,184,166,0.4), 0 4px 20px rgba(20,184,166,0.2)',
        'success':  '0 0 12px rgba(16,185,129,0.3)',
        'danger':   '0 0 12px rgba(239,68,68,0.3)',
      },
    }
  },
  plugins: [],
}
