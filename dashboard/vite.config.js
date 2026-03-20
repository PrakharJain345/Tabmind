import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
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
                  300: '#A78BFA',
                  400: '#8B5CF6',
                  500: '#7C3AED',
                },
                'pink': {
                  400: '#F472B6',
                  500: '#EC4899',
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
                'purple':   '0 0 0 1px rgba(124,58,237,0.5), 0 4px 20px rgba(124,58,237,0.25)',
                'pink':     '0 0 0 1px rgba(236,72,153,0.4), 0 4px 20px rgba(236,72,153,0.2)',
                'success':  '0 0 12px rgba(16,185,129,0.3)',
                'danger':   '0 0 12px rgba(239,68,68,0.3)',
              },
            }
          },
        }),
        autoprefixer(),
      ],
    },
  },
  server: {
    port: 3000,
  },
});
