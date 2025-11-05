import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand Colors (from tokens.css)
        brand: {
          DEFAULT: '#0fb34c',
          hover: '#059669',
        },
        accent: '#00ff66',
        cyan: '#00e5ff',
        
        // Background & Surface
        bg: '#0a0a0a',
        surface: {
          DEFAULT: '#18181b',
          hover: '#27272a',
        },
        
        // Borders
        border: {
          DEFAULT: '#27272a',
          accent: '#0fb34c',
        },
        
        // Text
        text: {
          primary: '#f4f4f5',
          secondary: '#a1a1aa',
          tertiary: '#71717a',
        },
        
        // Semantic
        success: '#10b981',
        danger: '#f43f5e',
        bull: '#10b981',
        bear: '#f43f5e',
        info: '#06b6d4',
        warn: '#f59e0b',
      },
      
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.33' }],
        sm: ['0.875rem', { lineHeight: '1.43' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.56' }],
        xl: ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.33' }],
      },
      
      spacing: {
        // 8px Grid
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '12': '3rem',    // 48px
      },
      
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      
      boxShadow: {
        'card-subtle': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'glow-accent': '0 0 10px rgba(0, 255, 102, 0.22)',
        'glow-brand': '0 0 12px rgba(255, 98, 0, 0.18)',
        'glow-cyan': '0 0 8px rgba(0, 229, 255, 0.2)',
      },
      
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0fb34c 0%, #059669 100%)',
      },
      
      transitionDuration: {
        '75': '75ms',
        '140': '140ms',
        '180': '180ms',
        '220': '220ms',
        '350': '350ms',
      },
      
      transitionTimingFunction: {
        'soft-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
