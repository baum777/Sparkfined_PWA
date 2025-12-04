import type { Config } from 'tailwindcss'
import { colors as designTokensColors } from './src/design-system/tokens/colors'
import { typography } from './src/design-system/tokens/typography'
import { spacing as spacingScale, borderRadius as radiusScale } from './src/design-system/tokens/spacing'
import { shadows as shadowTokens, glows } from './src/design-system/tokens/shadows'
import { animation } from './src/design-system/tokens/animation'

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`
const withFixedAlpha = (variable: string, alpha: number | string) => `rgb(var(${variable}) / ${alpha})`

const fontStack = (value: string) =>
  value
    .split(',')
    .map((item) => item.replace(/['"]/g, '').trim())
    .filter(Boolean)

const gradientTokens = designTokensColors.gradients

const designSystemColors = {
  void: designTokensColors.void,
  spark: designTokensColors.spark,
  smoke: designTokensColors.smoke,
  mist: designTokensColors.mist,
  gold: designTokensColors.gold,
  blood: designTokensColors.blood,
  phosphor: designTokensColors.phosphor,
  violet: designTokensColors.violet,
  ember: designTokensColors.ember,
}

const legacySpacing = {
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '10': '2.5rem',
  '11': '2.75rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '44': '11rem',
  '48': '12rem',
  '52': '13rem',
  '56': '14rem',
  '60': '15rem',
  '64': '16rem',
  '72': '18rem',
  '80': '20rem',
  '96': '24rem',
}

const spacingExtension = {
  ...legacySpacing,
  ...spacingScale,
}

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: designSystemColors.void,
        spark: designSystemColors.spark,
        smoke: designSystemColors.smoke,
        mist: designSystemColors.mist,
        gold: designSystemColors.gold,
        blood: designSystemColors.blood,
        phosphor: designSystemColors.phosphor,
        violet: designSystemColors.violet,
        ember: designSystemColors.ember,

        // Brand Colors (powered by tokens.css)
        brand: {
          DEFAULT: withAlpha('--color-brand'),
          hover: withAlpha('--color-brand-hover'),
        },
        accent: withAlpha('--color-accent'),

        // Background & Surface
        bg: {
          DEFAULT: withAlpha('--color-bg'),
          elevated: withAlpha('--color-bg-elevated'),
          surface: withAlpha('--color-surface'),
          'surface-subtle': withAlpha('--color-surface-subtle'),
          overlay: withAlpha('--color-bg-overlay'),
        },
        surface: {
          DEFAULT: withAlpha('--color-surface'),
          hover: withAlpha('--color-surface-hover'),
          elevated: withAlpha('--color-surface-elevated'),
          subtle: withAlpha('--color-surface-subtle'),
          skeleton: withFixedAlpha('--color-surface-skeleton', '0.05'),
          850: withAlpha('--color-surface-850'), // legacy compatibility
        },

        // Borders
        border: {
          DEFAULT: withAlpha('--color-border'),
          subtle: withFixedAlpha('--color-border-contrast', '0.06'),
          moderate: withFixedAlpha('--color-border-contrast', '0.1'),
          hover: withFixedAlpha('--color-border-contrast', '0.15'),
          accent: withAlpha('--color-border-accent'),
          focus: withAlpha('--color-border-focus'),
        },

        // Text
        text: {
          primary: withAlpha('--color-text-primary'),
          secondary: withAlpha('--color-text-secondary'),
          tertiary: withAlpha('--color-text-tertiary'),
        },

        // Interactive states
        interactive: {
          hover: withFixedAlpha('--color-interactive-base', '0.05'),
          active: withFixedAlpha('--color-interactive-base', '0.08'),
          disabled: withFixedAlpha('--color-interactive-base', '0.02'),
        },

        // Sentiment
        sentiment: {
          bull: {
            DEFAULT: withAlpha('--color-sentiment-bull'),
            bg: withFixedAlpha('--color-sentiment-bull', '0.12'),
            border: withFixedAlpha('--color-sentiment-bull', '0.6'),
          },
          bear: {
            DEFAULT: withAlpha('--color-sentiment-bear'),
            bg: withFixedAlpha('--color-sentiment-bear', '0.12'),
            border: withFixedAlpha('--color-sentiment-bear', '0.6'),
          },
          neutral: {
            DEFAULT: withAlpha('--color-sentiment-neutral'),
            bg: withFixedAlpha('--color-sentiment-neutral', '0.12'),
            border: withFixedAlpha('--color-sentiment-neutral', '0.6'),
          },
        },

        // Status backgrounds (alerts)
        status: {
          armed: {
            bg: withFixedAlpha('--color-status-armed', '0.15'),
            text: withAlpha('--color-status-armed'),
          },
          triggered: {
            bg: withFixedAlpha('--color-status-triggered', '0.15'),
            text: withAlpha('--color-status-triggered'),
          },
          snoozed: {
            bg: withFixedAlpha('--color-status-snoozed', '0.15'),
            text: withAlpha('--color-status-snoozed'),
          },
        },

        // Semantic
        success: withAlpha('--color-success'),
        danger: withAlpha('--color-danger'),
        bull: withAlpha('--color-sentiment-bull'),
        bear: withAlpha('--color-sentiment-bear'),
        info: withAlpha('--color-info'),
        warn: withAlpha('--color-warn'),
        
        // Zinc palette (complete spectrum for UI)
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1c1c1e',
          900: '#18181b',
          950: '#0a0a0a',
        },
        
        // Emerald palette (brand/success)
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        
        // Rose palette (danger/bear)
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        
        // Cyan palette (info/accents)
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        
        // Amber palette (warnings)
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // Slate palette (alternative grays)
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      
      fontFamily: {
        sans: fontStack(typography.fontFamily.primary),
        display: fontStack(typography.fontFamily.display),
        mono: fontStack(typography.fontFamily.mono),
      },
      
      fontSize: {
        ...typography.fontSize,
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.05' }],
      },
      
      spacing: spacingExtension,
      
      borderRadius: {
        ...radiusScale,
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      
      boxShadow: {
        ...shadowTokens,
        'glow-spark': glows.spark,
        'glow-gold': glows.gold,
        'glow-blood': glows.blood,
        'glow-phosphor': glows.phosphor,
        'card-subtle': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
        'glow-accent': '0 0 10px rgba(0, 255, 102, 0.22)',
        'glow-brand': '0 0 12px rgba(255, 98, 0, 0.18)',
        'glow-cyan': '0 0 8px rgba(0, 229, 255, 0.2)',
        'emerald-glow': '0 0 30px rgba(16, 185, 129, 0.3)',
        'emerald-glow-lg': '0 0 50px rgba(16, 185, 129, 0.5)',
        'emerald-glow-xl': '0 0 70px rgba(16, 185, 129, 0.6)',
        'rose-glow': '0 0 20px rgba(244, 63, 94, 0.3)',
      },
      
      backgroundImage: {
        'gradient-spark': gradientTokens.spark,
        'gradient-gold': gradientTokens.gold,
        'gradient-void': gradientTokens.void,
        'brand-gradient': 'linear-gradient(135deg, rgb(var(--color-brand)) 0%, rgb(var(--color-brand-hover)) 100%)',
        'emerald-gradient': 'linear-gradient(to right, rgb(var(--color-success)) 0%, rgb(var(--color-info)) 100%)',
        'grid-pattern': 'linear-gradient(to right, rgb(var(--color-border) / 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-border) / 0.2) 1px, transparent 1px)',
        'app-gradient': 'linear-gradient(to bottom, rgb(var(--color-bg-overlay) / 0.9) 0%, rgb(var(--color-bg)) 50%, rgb(var(--color-bg-overlay) / 0.95) 100%)',
        'surface-gradient': 'linear-gradient(135deg, rgb(var(--color-surface-subtle)) 0%, rgb(var(--color-surface-elevated)) 100%)',
      },
      
      backgroundSize: {
        'grid': '4rem 4rem',
      },
      
      transitionDuration: {
        ...animation.duration,
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '140': '140ms',
        '150': '150ms',
        '180': '180ms',
        '200': '200ms',
        '220': '220ms',
        '250': '250ms',
        '300': '300ms',
        '350': '350ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      transitionTimingFunction: {
        ...animation.easing,
        'soft-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'soft': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slide-up 250ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'slide-down': 'slide-down 250ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'slide-in-left': 'slide-in-left 350ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'scale-in': 'scale-in 150ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'ticker': 'ticker 20s linear infinite',
      },
      
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          'from': { opacity: '0', transform: 'translateY(-16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin': {
          'to': { transform: 'rotate(360deg)' },
        },
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'ticker': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // Line clamp utilities
      lineClamp: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
      },
      
      // Opacity values
      opacity: {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '15': '0.15',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '90': '0.9',
        '95': '0.95',
        '100': '1',
      },
      
      // Scale values
      scale: {
        '0': '0',
        '50': '0.5',
        '75': '0.75',
        '90': '0.9',
        '95': '0.95',
        '98': '0.98',
        '100': '1',
        '105': '1.05',
        '110': '1.1',
        '125': '1.25',
        '150': '1.5',
      },
      
      // Z-index values
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
      },
      
      // Max width values
      maxWidth: {
        'xs': '20rem',
        'sm': '24rem',
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        'full': '100%',
        'screen': '100vw',
      },
      
      // Letter spacing
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      
      // Filter utilities
      blur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // Brightness
      brightness: {
        0: '0',
        50: '0.5',
        75: '0.75',
        90: '0.9',
        95: '0.95',
        100: '1',
        105: '1.05',
        110: '1.1',
        125: '1.25',
        150: '1.5',
        200: '2',
      },
      
      // Saturate
      saturate: {
        0: '0',
        50: '0.5',
        100: '1',
        150: '1.5',
        200: '2',
      },
      
      // Container queries
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
