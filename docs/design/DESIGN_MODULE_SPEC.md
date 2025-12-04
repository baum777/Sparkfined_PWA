# Sparkfined Design System – Module Specification & Implementation Guide

> **Purpose**: This document bridges the design specification (`DESIGN_SYSTEM.md`) and the codebase, providing a concrete module architecture and implementation roadmap for Codex (Implementation Agent).

**Status**: Ready for Implementation  
**Last Updated**: 2025-12-04  
**Owner**: Claude (UI/UX Architect)  
**Target**: Codex (Implementation Agent)

---

## Table of Contents

1. [Gap Analysis](#gap-analysis)
2. [Module Architecture](#module-architecture)
3. [Design Token Migration](#design-token-migration)
4. [Component API Specifications](#component-api-specifications)
5. [Implementation Brief for Codex](#implementation-brief-for-codex)
6. [Acceptance Criteria](#acceptance-criteria)
7. [Testing Strategy](#testing-strategy)
8. [Changelog](#changelog)

---

## Gap Analysis

### Current State vs. Design Specification

| Aspect | Design Spec | Current Implementation | Action Required |
|--------|-------------|------------------------|-----------------|
| **Color Palette** | Spark (cyan #00F0FF), Void (#0A0A0A), mystical theme | Emerald green (#10b981), Zinc grays | ⚠️ **Migration needed** |
| **Typography** | Space Grotesk (display), Inter (body), JetBrains Mono (code) | System fonts only | ⚠️ **Add fonts** |
| **Spacing** | 8px grid with semantic names | 8px grid (Tailwind default) | ✅ **Compatible** |
| **Components** | 12+ components specified | Button, Card, Badge, Input (basic) | ⚠️ **Add missing** |
| **Animation** | Framer Motion with specific easing | Partially implemented | ⚠️ **Enhance** |
| **Mobile Gestures** | Swipe, drag, pull-to-refresh | Not implemented | ⚠️ **Add** |
| **Shadows/Glows** | Mystical glow effects | Basic shadows only | ⚠️ **Add glows** |

### Critical Issues

1. **Brand Color Mismatch**: Design spec uses cyan "Spark" branding, but current implementation uses emerald green.
2. **Typography**: Design requires specific fonts (Space Grotesk, Inter) not currently loaded.
3. **Missing Components**: Alert, Modal, Tooltip, BottomSheet, and gesture-based components.
4. **Mystical Theme**: Gradient and glow effects not implemented.

### Migration Strategy

**Option A: Full Migration** (Recommended)
- Migrate all color tokens to match design spec
- Update all existing components
- Add missing fonts
- Risk: Visual breaking changes across entire app

**Option B: Gradual Migration**
- Keep current emerald theme as default
- Add Spark theme as optional variant
- Migrate page-by-page
- Risk: Inconsistent branding during transition

**Decision for Codex**: Proceed with **Option A** for consistent branding.

---

## Module Architecture

### Directory Structure

```
src/
├── design-system/           # NEW: Centralized design system
│   ├── tokens/
│   │   ├── colors.ts        # Color definitions matching design spec
│   │   ├── typography.ts    # Font families, scales, weights
│   │   ├── spacing.ts       # Spacing scale (8px base)
│   │   ├── shadows.ts       # Shadows and glow effects
│   │   ├── animation.ts     # Duration, easing functions
│   │   └── index.ts         # Re-export all tokens
│   │
│   ├── theme/
│   │   ├── sparkTheme.ts    # Main theme object (Spark/Void/mystical)
│   │   ├── lightTheme.ts    # Light mode variant (optional)
│   │   └── index.ts         # Theme provider setup
│   │
│   ├── components/          # Design system components (NEW implementations)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx  # Optional: Storybook
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   └── Card.test.tsx
│   │   ├── Badge/
│   │   ├── Alert/
│   │   ├── Modal/
│   │   ├── Input/
│   │   ├── Tooltip/
│   │   ├── BottomSheet/
│   │   └── index.ts
│   │
│   ├── primitives/          # Lower-level UI primitives
│   │   ├── AnimatedElement.tsx  # Base motion component
│   │   ├── Glow.tsx             # Glow effect wrapper
│   │   ├── GradientText.tsx     # Gradient text component
│   │   └── index.ts
│   │
│   ├── gestures/            # Mobile gesture hooks
│   │   ├── useSwipeable.ts
│   │   ├── usePullToRefresh.ts
│   │   ├── useBottomSheet.ts
│   │   ├── useDragReorder.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── haptic.ts        # Haptic feedback utilities
│   │   ├── cn.ts            # Class name merger (keep existing)
│   │   └── motion.ts        # Framer Motion helpers
│   │
│   └── index.ts             # Public API exports
│
├── styles/                  # Keep existing, update tokens
│   ├── design-tokens.css    # UPDATE: Migrate to Spark colors
│   ├── fonts.css            # UPDATE: Add Space Grotesk, Inter
│   ├── motion.css           # UPDATE: Add glow animations
│   └── index.css            # Entry point
│
├── components/ui/           # EXISTING: Migrate or deprecate
│   ├── Button.tsx           # MIGRATE → design-system/components/Button
│   ├── Card.tsx             # MIGRATE → design-system/components/Card
│   ├── Badge.tsx            # MIGRATE → design-system/components/Badge
│   └── ...
│
└── lib/ui/                  # Keep utilities
    └── cn.ts                # Keep as-is or move to design-system/utils
```

### Import Strategy

**Before:**
```tsx
import Button from '@/components/ui/Button'
```

**After (Preferred):**
```tsx
import { Button } from '@/design-system'
```

**Migration Path:**
```tsx
// Step 1: Re-export from old location for backward compatibility
// src/components/ui/Button.tsx
export { Button } from '@/design-system/components/Button'

// Step 2: Gradually update imports across codebase
// Step 3: Remove old files once migration complete
```

---

## Design Token Migration

### 1. Color Tokens (`src/design-system/tokens/colors.ts`)

**Replace** current emerald/zinc palette with Spark/Void mystical theme:

```typescript
// src/design-system/tokens/colors.ts
export const colors = {
  // Primary Brand Colors
  void: {
    DEFAULT: '#0A0A0A',      // Main background
    lighter: '#121212',       // Elevated surfaces
    lightest: '#1A1A1A',      // Hover states
  },
  
  spark: {
    DEFAULT: '#00F0FF',       // Primary accent, CTAs
    dim: '#00BCD4',           // Hover/disabled
    glow: 'rgba(0, 240, 255, 0.25)', // Glow effects
  },
  
  smoke: {
    DEFAULT: '#2A2A2A',       // Cards, containers
    light: '#3A3A3A',         // Borders, dividers
    lighter: '#4A4A4A',       // Disabled states
  },
  
  mist: {
    DEFAULT: '#FFFFFF',       // Primary text
    fog: '#9B9B9B',           // Secondary text
    ash: '#6B6B6B',           // Tertiary text
  },
  
  // Semantic Colors
  gold: {
    DEFAULT: '#FFB800',
    dim: '#FF9800',
    glow: 'rgba(255, 184, 0, 0.2)',
  },
  
  blood: {
    DEFAULT: '#FF006E',
    dim: '#E91E63',
    glow: 'rgba(255, 0, 110, 0.2)',
  },
  
  phosphor: {
    DEFAULT: '#39FF14',
    dim: '#00E676',
    glow: 'rgba(57, 255, 20, 0.2)',
  },
  
  // Mystical Accents (use sparingly)
  violet: {
    DEFAULT: '#9D4EDD',
    glow: 'rgba(157, 78, 221, 0.2)',
  },
  
  ember: {
    DEFAULT: '#FF4500',
    glow: 'rgba(255, 69, 0, 0.2)',
  },
  
  // Gradients
  gradients: {
    spark: 'linear-gradient(135deg, #00F0FF 0%, #9D4EDD 100%)',
    gold: 'linear-gradient(135deg, #FFB800 0%, #FF4500 100%)',
    void: 'linear-gradient(180deg, #0A0A0A 0%, #121212 100%)',
    glowSpark: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.25) 0%, transparent 70%)',
  },
}

// RGB values for CSS variables (required for alpha compositing)
export const colorsRGB = {
  void: '10, 10, 10',
  'void-lighter': '18, 18, 18',
  spark: '0, 240, 255',
  smoke: '42, 42, 42',
  mist: '255, 255, 255',
  // ... etc
}
```

### 2. Typography Tokens (`src/design-system/tokens/typography.ts`)

```typescript
export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "'Space Grotesk', var(--font-primary)",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],   // 12px
    sm: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],  // 14px
    base: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],    // 16px
    lg: ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }], // 24px
    '3xl': ['2rem', { lineHeight: '1.25', fontWeight: '700' }],  // 32px
    '4xl': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 40px
    '5xl': ['3rem', { lineHeight: '1.2', fontWeight: '900' }],   // 48px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em',
  },
}
```

### 3. Spacing Tokens (`src/design-system/tokens/spacing.ts`)

```typescript
// 8px base grid (already compatible with Tailwind)
export const spacing = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px - base unit
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.5rem',    // 24px
  6: '2rem',      // 32px
  8: '3rem',      // 48px
  10: '4rem',     // 64px
  12: '6rem',     // 96px
}

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
}
```

### 4. Shadow & Glow Tokens (`src/design-system/tokens/shadows.ts`)

```typescript
export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.5)',
  md: '0 4px 8px rgba(0, 0, 0, 0.6)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.7)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.8)',
}

export const glows = {
  spark: '0 0 20px rgba(0, 240, 255, 0.25), 0 0 40px rgba(0, 240, 255, 0.25)',
  gold: '0 0 20px rgba(255, 184, 0, 0.2), 0 0 40px rgba(255, 184, 0, 0.2)',
  blood: '0 0 20px rgba(255, 0, 51, 0.2), 0 0 40px rgba(255, 0, 110, 0.2)',
  phosphor: '0 0 20px rgba(57, 255, 20, 0.2), 0 0 40px rgba(57, 255, 20, 0.2)',
}
```

### 5. Animation Tokens (`src/design-system/tokens/animation.ts`)

```typescript
export const animation = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  easing: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',      // Elements entering
    in: 'cubic-bezier(0.7, 0, 0.84, 0)',       // Elements exiting
    inOut: 'cubic-bezier(0.87, 0, 0.13, 1)',   // Reversible
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Playful
  },
}
```

### 6. Update `tailwind.config.ts`

Wire design tokens into Tailwind configuration:

```typescript
// tailwind.config.ts
import { colors, colorsRGB } from './src/design-system/tokens/colors'
import { typography } from './src/design-system/tokens/typography'
import { spacing, borderRadius } from './src/design-system/tokens/spacing'
import { shadows, glows } from './src/design-system/tokens/shadows'
import { animation } from './src/design-system/tokens/animation'

export default {
  theme: {
    extend: {
      colors: {
        void: colors.void,
        spark: colors.spark,
        smoke: colors.smoke,
        mist: colors.mist,
        gold: colors.gold,
        blood: colors.blood,
        phosphor: colors.phosphor,
        violet: colors.violet,
        ember: colors.ember,
      },
      
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      
      spacing: spacing,
      borderRadius: borderRadius,
      
      boxShadow: {
        ...shadows,
        'glow-spark': glows.spark,
        'glow-gold': glows.gold,
        'glow-blood': glows.blood,
        'glow-phosphor': glows.phosphor,
      },
      
      backgroundImage: {
        'gradient-spark': colors.gradients.spark,
        'gradient-gold': colors.gradients.gold,
        'gradient-void': colors.gradients.void,
      },
      
      transitionDuration: animation.duration,
      transitionTimingFunction: animation.easing,
    },
  },
}
```

### 7. Update `src/styles/design-tokens.css`

Replace with Spark colors (migrate from emerald):

```css
:root {
  color-scheme: dark;

  /* Brand Colors - Spark Theme (RGB format for alpha compositing) */
  --color-void: 10, 10, 10;
  --color-void-lighter: 18, 18, 18;
  --color-void-lightest: 26, 26, 26;
  
  --color-spark: 0, 240, 255;
  --color-spark-dim: 0, 188, 212;
  
  --color-smoke: 42, 42, 42;
  --color-smoke-light: 58, 58, 58;
  --color-smoke-lighter: 74, 74, 74;
  
  --color-mist: 255, 255, 255;
  --color-fog: 155, 155, 155;
  --color-ash: 107, 107, 107;
  
  /* Semantic */
  --color-gold: 255, 184, 0;
  --color-blood: 255, 0, 110;
  --color-phosphor: 57, 255, 20;
  
  /* Mystical Accents */
  --color-violet: 157, 78, 221;
  --color-ember: 255, 69, 0;
  
  /* Map to semantic aliases */
  --color-brand: var(--color-spark);
  --color-brand-hover: var(--color-spark-dim);
  --color-success: var(--color-phosphor);
  --color-danger: var(--color-blood);
  --color-warning: var(--color-gold);
  
  /* ... rest of tokens */
}
```

### 8. Add Fonts (`src/styles/fonts.css`)

```css
/* src/styles/fonts.css */

/* Inter - Body & UI */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');

/* Space Grotesk - Display & Headlines */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* JetBrains Mono - Code & Data */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
```

---

## Component API Specifications

### Button Component

```tsx
// src/design-system/components/Button/Button.tsx

import { motion } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-spark text-void border border-spark/20 hover:shadow-glow-spark',
  secondary: 'bg-transparent text-spark border-2 border-spark hover:bg-spark hover:text-void',
  ghost: 'bg-transparent text-mist hover:bg-smoke hover:text-spark',
  danger: 'bg-blood text-mist hover:shadow-glow-blood',
  success: 'bg-phosphor text-void hover:shadow-glow-phosphor',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm rounded-md',
  md: 'h-11 px-5 text-base rounded-lg',
  lg: 'h-14 px-8 text-lg rounded-xl',
  xl: 'h-16 px-10 text-xl rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium tracking-wide',
        'transition-all duration-250 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <SpinnerIcon className="animate-spin" />
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </motion.button>
  )
}
```

**Usage:**
```tsx
<Button variant="primary" size="md" onClick={handleSave}>
  Save Changes
</Button>

<Button variant="ghost" size="sm" leftIcon={<PlusIcon />}>
  Add Alert
</Button>

<Button variant="danger" isLoading={isDeleting}>
  Delete
</Button>
```

---

### Card Component

```tsx
// src/design-system/components/Card/Card.tsx

import { motion } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'

export type CardVariant = 'default' | 'interactive' | 'glow'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-smoke border-smoke-light',
  interactive: 'bg-smoke border-smoke-light hover:border-spark hover:shadow-glow-spark cursor-pointer',
  glow: 'bg-smoke border-spark shadow-glow-spark',
}

export function Card({
  variant = 'default',
  interactive = false,
  className,
  children,
  onClick,
  ...props
}: CardProps) {
  const isInteractive = interactive || typeof onClick === 'function'
  
  const Component = isInteractive ? motion.div : 'div'
  const motionProps = isInteractive ? {
    whileHover: { y: -2, borderColor: '#00F0FF' },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
  } : {}
  
  return (
    <Component
      className={cn(
        'rounded-lg border p-4 transition-all duration-250',
        variantStyles[variant],
        className
      )}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-3 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-semibold text-mist font-display', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-fog', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-fog', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 flex items-center justify-between gap-3', className)} {...props}>
      {children}
    </div>
  )
}
```

---

### Badge Component

```tsx
// src/design-system/components/Badge/Badge.tsx

import { cn } from '@/design-system/utils/cn'

export type BadgeVariant = 'armed' | 'triggered' | 'paused' | 'default'
export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  pulsing?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  armed: 'bg-spark/20 text-spark border-spark/30',
  triggered: 'bg-gold/20 text-gold border-gold/30',
  paused: 'bg-smoke/50 text-fog border-smoke-light',
  default: 'bg-smoke-light text-fog border-smoke-lighter',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[10px]',
  md: 'h-6 px-2.5 text-xs',
  lg: 'h-7 px-3 text-sm',
}

export function Badge({
  variant = 'default',
  size = 'md',
  pulsing = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wider',
        variantStyles[variant],
        sizeStyles[size],
        pulsing && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

---

### Alert Component (NEW)

```tsx
// src/design-system/components/Alert/Alert.tsx

import { cn } from '@/design-system/utils/cn'

export type AlertVariant = 'armed' | 'triggered' | 'paused'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title: string
  description?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
}

const variantStyles: Record<AlertVariant, string> = {
  armed: 'bg-spark/5 border-spark text-spark before:bg-spark',
  triggered: 'bg-gold/5 border-gold text-gold before:bg-gold animate-pulse-subtle',
  paused: 'bg-smoke/50 border-smoke-light text-fog before:bg-fog',
}

export function Alert({
  variant = 'armed',
  title,
  description,
  badge,
  actions,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-lg',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="font-semibold mb-2 flex items-center gap-2">
            {title}
          </div>
          {description && (
            <p className="text-sm opacity-90">{description}</p>
          )}
        </div>
        {badge && <div>{badge}</div>}
      </div>
      {actions && (
        <div className="mt-3 flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
```

---

### Modal Component (NEW)

```tsx
// src/design-system/components/Modal/Modal.tsx

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-[95vw]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              className={cn(
                'w-full rounded-xl bg-smoke border border-smoke-light p-6',
                'shadow-xl shadow-void/50',
                sizeStyles[size]
              )}
            >
              {(title || description) && (
                <div className="mb-4">
                  {title && (
                    <h2 className="text-2xl font-bold text-mist font-display">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-2 text-sm text-fog">
                      {description}
                    </p>
                  )}
                </div>
              )}
              
              <div>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
```

---

## Implementation Brief for Codex

### Role & Scope

**Role**: Codex – Implementation Agent  
**Goal**: Implement the Sparkfined Design System as a centralized, production-ready module  
**Scope**: Create design tokens, theme, components, and gestures as defined in this specification  
**Timeline**: Incremental implementation, ensuring zero breaking changes to existing pages

---

### Task Checklist

#### Phase 1: Foundation – Design Tokens & Theme (Priority: CRITICAL)

- [ ] **Task 1.1**: Create `src/design-system/tokens/` directory structure
  - [ ] `colors.ts` - Spark/Void/mystical color palette
  - [ ] `typography.ts` - Font families, scales, weights
  - [ ] `spacing.ts` - 8px grid spacing + border radius
  - [ ] `shadows.ts` - Shadow scales + glow effects
  - [ ] `animation.ts` - Duration + easing functions
  - [ ] `index.ts` - Re-export all tokens

- [ ] **Task 1.2**: Update `tailwind.config.ts`
  - [ ] Import design tokens
  - [ ] Wire tokens into Tailwind theme.extend
  - [ ] Add glow box-shadow utilities
  - [ ] Add gradient background-image utilities

- [ ] **Task 1.3**: Update `src/styles/design-tokens.css`
  - [ ] Replace emerald colors → Spark cyan colors
  - [ ] Update CSS custom properties to match design spec
  - [ ] Keep RGB format for alpha compositing

- [ ] **Task 1.4**: Add font imports in `src/styles/fonts.css`
  - [ ] Add Inter (body/UI)
  - [ ] Add Space Grotesk (display/headlines)
  - [ ] Add JetBrains Mono (code/data)
  - [ ] Import in main CSS entry point

**Acceptance Criteria:**
- ✅ All tokens accessible via TypeScript imports
- ✅ Tailwind config correctly references tokens
- ✅ CSS variables match design spec (Spark colors)
- ✅ Fonts load correctly (verify in DevTools Network tab)
- ✅ No TypeScript errors
- ✅ No visual regressions (old components still work)

---

#### Phase 2: Core Components (Priority: HIGH)

- [ ] **Task 2.1**: Implement `Button` component
  - [ ] Create `src/design-system/components/Button/Button.tsx`
  - [ ] Variants: `primary`, `secondary`, `ghost`, `danger`, `success`
  - [ ] Sizes: `sm`, `md`, `lg`, `xl`
  - [ ] States: `isLoading`, `disabled`
  - [ ] Icons: `leftIcon`, `rightIcon` support
  - [ ] Framer Motion: `whileHover` (scale 1.05), `whileTap` (scale 0.95)
  - [ ] Focus: Ring style with `focus-visible:ring-spark`
  - [ ] Test: `Button.test.tsx` (render, variants, states, interactions)

- [ ] **Task 2.2**: Implement `Card` component
  - [ ] Create `src/design-system/components/Card/Card.tsx`
  - [ ] Variants: `default`, `interactive`, `glow`
  - [ ] Sub-components: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - [ ] Interactive hover: Border glow + translate Y (-2px)
  - [ ] Test: `Card.test.tsx`

- [ ] **Task 2.3**: Implement `Badge` component
  - [ ] Create `src/design-system/components/Badge/Badge.tsx`
  - [ ] Variants: `armed`, `triggered`, `paused`, `default`
  - [ ] Sizes: `sm`, `md`, `lg`
  - [ ] Optional `pulsing` animation
  - [ ] Test: `Badge.test.tsx`

- [ ] **Task 2.4**: Implement `Alert` component (NEW)
  - [ ] Create `src/design-system/components/Alert/Alert.tsx`
  - [ ] Variants: `armed`, `triggered`, `paused`
  - [ ] Left accent bar (colored 1px stripe)
  - [ ] Support `badge` and `actions` slots
  - [ ] Test: `Alert.test.tsx`

- [ ] **Task 2.5**: Implement `Modal` component (NEW)
  - [ ] Create `src/design-system/components/Modal/Modal.tsx`
  - [ ] Backdrop with blur effect
  - [ ] Scale-in animation (Framer Motion)
  - [ ] Sizes: `sm`, `md`, `lg`, `full`
  - [ ] Focus trap (ensure keyboard navigation works)
  - [ ] Close on backdrop click or ESC key
  - [ ] Test: `Modal.test.tsx`

- [ ] **Task 2.6**: Implement `Input` component
  - [ ] Create `src/design-system/components/Input/Input.tsx`
  - [ ] Variants: `default`, `error`
  - [ ] Sizes: `sm`, `md`, `lg`
  - [ ] Support `leftIcon`, `rightIcon`
  - [ ] Focus: Ring style with spark glow
  - [ ] Test: `Input.test.tsx`

- [ ] **Task 2.7**: Implement `Tooltip` component (NEW)
  - [ ] Create `src/design-system/components/Tooltip/Tooltip.tsx`
  - [ ] Positioning: `top`, `bottom`, `left`, `right`
  - [ ] Fade + slide animation
  - [ ] Portal rendering (outside parent overflow)
  - [ ] Test: `Tooltip.test.tsx`

**Acceptance Criteria:**
- ✅ All components follow design spec exactly (colors, spacing, shadows)
- ✅ All components are accessible (keyboard nav, ARIA labels, focus states)
- ✅ All components have unit tests
- ✅ All components use design tokens (no hardcoded values)
- ✅ Framer Motion animations work smoothly (60fps)

---

#### Phase 3: Mobile Gestures (Priority: MEDIUM)

- [ ] **Task 3.1**: Implement `useSwipeable` hook
  - [ ] Create `src/design-system/gestures/useSwipeable.ts`
  - [ ] Support swipe actions: `onSwipeLeft`, `onSwipeRight`
  - [ ] Thresholds: 150px or velocity > 500px/s
  - [ ] Progressive reveal of action (opacity transform)
  - [ ] Example usage: Swipe-to-delete alerts

- [ ] **Task 3.2**: Implement `usePullToRefresh` hook
  - [ ] Create `src/design-system/gestures/usePullToRefresh.ts`
  - [ ] Pull threshold: 80px
  - [ ] States: `idle`, `pulling`, `ready`, `refreshing`, `complete`
  - [ ] Haptic feedback at threshold (if supported)
  - [ ] Visual indicator (arrow → spinner → checkmark)

- [ ] **Task 3.3**: Implement `useBottomSheet` hook
  - [ ] Create `src/design-system/gestures/useBottomSheet.ts`
  - [ ] Drag down to close (threshold: 100px or velocity > 300)
  - [ ] Spring animation (damping: 30, stiffness: 300)
  - [ ] Backdrop click to close

- [ ] **Task 3.4**: Implement `useDragReorder` hook (Framer Reorder)
  - [ ] Create `src/design-system/gestures/useDragReorder.ts`
  - [ ] Use Framer Motion's `<Reorder>` component
  - [ ] Drag handle indicator
  - [ ] Scale + glow on active drag

- [ ] **Task 3.5**: Implement haptic utilities
  - [ ] Create `src/design-system/utils/haptic.ts`
  - [ ] Functions: `tap()`, `impact()`, `success()`, `error()`, `warning()`
  - [ ] Check `navigator.vibrate` support

**Acceptance Criteria:**
- ✅ Gestures work on mobile devices (test on real devices if possible)
- ✅ Gestures respect touch-action CSS
- ✅ Gestures have smooth animations (no jank)
- ✅ Gestures are cancelable (return to neutral position)
- ✅ Haptic feedback works (on supported devices)

---

#### Phase 4: Primitives & Utilities (Priority: MEDIUM)

- [ ] **Task 4.1**: Implement `Glow` wrapper component
  - [ ] Create `src/design-system/primitives/Glow.tsx`
  - [ ] Adds glow effect to children
  - [ ] Variants: `spark`, `gold`, `blood`, `phosphor`
  - [ ] Optional pulsing animation

- [ ] **Task 4.2**: Implement `GradientText` component
  - [ ] Create `src/design-system/primitives/GradientText.tsx`
  - [ ] Applies gradient to text via background-clip
  - [ ] Gradients: `spark`, `gold`

- [ ] **Task 4.3**: Implement `AnimatedElement` base component
  - [ ] Create `src/design-system/primitives/AnimatedElement.tsx`
  - [ ] Wraps Framer Motion with default animations
  - [ ] Presets: `fadeIn`, `slideUp`, `scaleIn`, `bounce`

- [ ] **Task 4.4**: Implement motion utilities
  - [ ] Create `src/design-system/utils/motion.ts`
  - [ ] Helper functions: `fadeInVariants()`, `slideUpVariants()`, `staggerChildren()`
  - [ ] Respect `prefers-reduced-motion`

**Acceptance Criteria:**
- ✅ Primitives are reusable across components
- ✅ Motion utilities reduce code duplication
- ✅ Animations respect accessibility (reduced motion)

---

#### Phase 5: Integration & Migration (Priority: HIGH)

- [ ] **Task 5.1**: Create public API exports
  - [ ] Create `src/design-system/index.ts`
  - [ ] Export all components, tokens, hooks, utilities
  - [ ] Example: `export { Button, Card, Badge } from './components'`

- [ ] **Task 5.2**: Add backward compatibility layer
  - [ ] Keep old components in `src/components/ui/` temporarily
  - [ ] Re-export from new design system:
    ```tsx
    // src/components/ui/Button.tsx
    export { Button } from '@/design-system/components/Button'
    ```
  - [ ] Add deprecation comments

- [ ] **Task 5.3**: Update key pages incrementally
  - [ ] Pick 1-2 low-risk pages (e.g., Dashboard, Settings)
  - [ ] Replace old components with new design system components
  - [ ] Test thoroughly before moving to next page

- [ ] **Task 5.4**: Update Storybook (if used)
  - [ ] Add stories for all new components
  - [ ] Document variants, sizes, states
  - [ ] Add usage examples

**Acceptance Criteria:**
- ✅ All new components accessible via `import { X } from '@/design-system'`
- ✅ Old components still work (no breaking changes)
- ✅ At least 2 pages migrated successfully
- ✅ No console errors or warnings
- ✅ Visual regression tests pass (if applicable)

---

#### Phase 6: Testing & Documentation (Priority: HIGH)

- [ ] **Task 6.1**: Add unit tests for all components
  - [ ] Use Vitest + React Testing Library
  - [ ] Test: Rendering, variants, states, interactions
  - [ ] Coverage: Aim for >80%

- [ ] **Task 6.2**: Add E2E tests for key user flows
  - [ ] Use Playwright
  - [ ] Test: Button clicks, modal open/close, form interactions
  - [ ] Use `data-testid` attributes for stable selectors

- [ ] **Task 6.3**: Update component documentation
  - [ ] Add JSDoc comments to all components
  - [ ] Document props, variants, usage examples
  - [ ] Link to design spec in comments

- [ ] **Task 6.4**: Create usage guide in `/docs`
  - [ ] Add section to this file (below) with code examples
  - [ ] Document common patterns (e.g., form layouts)
  - [ ] Add migration guide from old components

**Acceptance Criteria:**
- ✅ All components have unit tests
- ✅ E2E tests pass for critical flows
- ✅ Test coverage >80%
- ✅ Documentation is clear and complete

---

## Acceptance Criteria (Overall)

### Visual Fidelity
- ✅ All colors match design spec (Spark cyan, Void black, mystical palette)
- ✅ All fonts load correctly (Space Grotesk, Inter, JetBrains Mono)
- ✅ All spacing follows 8px grid
- ✅ Glow effects render correctly (no performance issues)
- ✅ Animations are smooth (60fps)

### Code Quality
- ✅ All TypeScript types defined (no `any`)
- ✅ All components use design tokens (no hardcoded values)
- ✅ All components follow existing patterns (e.g., `cn()` utility)
- ✅ No ESLint or TypeScript errors
- ✅ No console warnings in browser

### Accessibility
- ✅ All components keyboard-accessible
- ✅ All interactive elements have focus states
- ✅ All icon-only buttons have aria-labels
- ✅ Color contrast meets WCAG AA (4.5:1 minimum)
- ✅ Animations respect `prefers-reduced-motion`

### Testing
- ✅ All components have unit tests (>80% coverage)
- ✅ E2E tests pass for critical flows
- ✅ Tests use `data-testid` (not fragile selectors)
- ✅ Tests are deterministic (no flakiness)

### Documentation
- ✅ All components documented with JSDoc
- ✅ Usage examples added to this file
- ✅ Migration guide provided for old components
- ✅ Design system README created

### Performance
- ✅ No layout shifts (CLS < 0.1)
- ✅ Animations run at 60fps
- ✅ Fonts load efficiently (font-display: swap)
- ✅ No memory leaks in React components

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

**Location**: `src/design-system/components/*/tests/*.test.tsx`

**Test Coverage:**
- Component renders without crashing
- All variants render correctly
- All sizes render correctly
- Disabled state prevents interactions
- Loading state shows spinner
- Click handlers fire correctly
- Keyboard interactions work (Enter, Space, Escape)
- Focus states apply correctly

**Example Test:**
```tsx
// src/design-system/components/Button/tests/Button.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
  
  it('applies primary variant styles', () => {
    render(<Button variant="primary">Primary</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-spark')
  })
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### E2E Tests (Playwright)

**Location**: `tests/e2e/design-system/*.spec.ts`

**Test Flows:**
- User can open and close modal
- User can interact with buttons (all variants)
- User can swipe to delete alert
- User can drag to reorder watchlist items
- Form validation shows error states

**Example Test:**
```typescript
// tests/e2e/design-system/modal.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Modal Component', () => {
  test('opens and closes modal', async ({ page }) => {
    await page.goto('/test-modal')
    
    // Modal hidden initially
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible()
    
    // Click trigger button
    await page.click('[data-testid="open-modal-btn"]')
    
    // Modal visible
    await expect(page.locator('[data-testid="modal"]')).toBeVisible()
    
    // Close via backdrop
    await page.click('[data-testid="modal-backdrop"]')
    
    // Modal hidden again
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible()
  })
  
  test('closes modal on ESC key', async ({ page }) => {
    await page.goto('/test-modal')
    await page.click('[data-testid="open-modal-btn"]')
    await expect(page.locator('[data-testid="modal"]')).toBeVisible()
    
    await page.keyboard.press('Escape')
    
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible()
  })
})
```

### Visual Regression Tests (Optional)

If using Percy, Chromatic, or similar:
- Capture screenshots of all component variants
- Compare against baseline on PR
- Flag visual changes for review

---

## Usage Examples

### Basic Page Layout

```tsx
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/design-system'

function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-mist font-display mb-8">
        Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="interactive" onClick={() => console.log('Card clicked')}>
          <CardHeader>
            <CardTitle>Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-spark font-mono">127</p>
            <p className="text-sm text-fog">+12% vs last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-phosphor font-mono">68%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gold font-mono">5</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex gap-4">
        <Button variant="primary" size="lg">
          Create New Trade
        </Button>
        <Button variant="secondary" size="lg">
          View All Alerts
        </Button>
      </div>
    </div>
  )
}
```

### Alert List with Actions

```tsx
import { Alert, Badge, Button } from '@/design-system'

function AlertsList() {
  return (
    <div className="space-y-4">
      <Alert
        variant="armed"
        title="BTCUSDT 4H"
        description="Price closes above $42,500 with RSI > 60"
        badge={<Badge variant="armed" pulsing>ARMED</Badge>}
        actions={
          <>
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="danger" size="sm">Delete</Button>
          </>
        }
      />
      
      <Alert
        variant="triggered"
        title="ETHUSDT 1D"
        description="Breakout confirmed, volume spike detected"
        badge={<Badge variant="triggered">TRIGGERED</Badge>}
        actions={
          <Button variant="ghost" size="sm">Acknowledge</Button>
        }
      />
      
      <Alert
        variant="paused"
        title="SOLUSDT 15m"
        description="Waiting for retest of support level"
        badge={<Badge variant="paused">PAUSED</Badge>}
        actions={
          <Button variant="ghost" size="sm">Resume</Button>
        }
      />
    </div>
  )
}
```

### Modal with Form

```tsx
import { Modal, Button, Input } from '@/design-system'
import { useState } from 'react'

function CreateAlertModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Create Alert
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Alert"
        description="Set up price and indicator conditions"
        size="lg"
      >
        <form className="space-y-4">
          <Input
            placeholder="Alert name"
            aria-label="Alert name"
          />
          
          <Input
            placeholder="Price target"
            type="number"
            aria-label="Price target"
          />
          
          <div className="flex gap-3">
            <Button variant="primary" type="submit">
              Create Alert
            </Button>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
```

---

## Changelog

### 2025-12-04 - Initial Specification
- Created comprehensive design module architecture
- Defined token structure (colors, typography, spacing, shadows, animation)
- Specified component APIs (Button, Card, Badge, Alert, Modal, Input, Tooltip)
- Defined gesture hooks (swipeable, pull-to-refresh, bottom sheet, drag reorder)
- Created implementation roadmap for Codex
- Added testing strategy and acceptance criteria
- Added usage examples

---

## Notes for Codex

### Implementation Guidelines

1. **Start with Phase 1** (Design Tokens): This is the foundation. Without correct tokens, components won't look right.

2. **No Breaking Changes**: The current app is production-ready. All changes must be backward-compatible.

3. **Test As You Go**: Don't implement all components then test. Test each component immediately after implementation.

4. **Use Existing Patterns**: The repo already has patterns (e.g., `cn()` utility). Follow them.

5. **Consult Design Spec**: If anything is unclear, refer to `/docs/design/DESIGN_SYSTEM.md` (the full design specification).

6. **Ask Questions**: If you encounter conflicts or ambiguities, flag them rather than guessing.

7. **Incremental PRs**: If possible, break work into smaller PRs (e.g., Phase 1 = PR 1, Phase 2 = PR 2).

### Common Pitfalls to Avoid

- ❌ Hardcoding colors/sizes instead of using tokens
- ❌ Breaking existing components before replacements are ready
- ❌ Ignoring accessibility (keyboard nav, ARIA labels)
- ❌ Animating expensive properties (width, height, top, left)
- ❌ Not testing on mobile devices
- ❌ Forgetting to respect `prefers-reduced-motion`

### Success Metrics

- Zero visual regressions on existing pages
- All new components pass accessibility audit
- 60fps animation performance
- >80% test coverage
- Zero TypeScript/ESLint errors
- Documentation complete and accurate

---

**End of Specification**

*For questions or clarifications, contact: Claude (UI/UX Architect)*
