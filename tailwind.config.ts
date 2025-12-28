import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Legacy shadcn tokens (keep for component compatibility)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // SPARKFINED Design System tokens
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          hover: "rgb(var(--color-brand-hover) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
        },
        root: "rgb(var(--color-root) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          subtle: "rgb(var(--color-surface-subtle) / <alpha-value>)",
          elevated: "rgb(var(--color-surface-elevated) / <alpha-value>)",
          hover: "rgb(var(--color-surface-hover) / <alpha-value>)",
          skeleton: "rgb(255 255 255 / 0.05)",
        },
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--color-text-tertiary) / <alpha-value>)",
        },
        "border-sf": {
          subtle: "rgb(255 255 255 / 0.05)",
          moderate: "rgb(255 255 255 / 0.10)",
          DEFAULT: "rgb(var(--color-border-default) / <alpha-value>)",
          hover: "rgb(255 255 255 / 0.15)",
          accent: "rgb(var(--color-border-accent) / <alpha-value>)",
          focus: "rgb(var(--color-border-focus) / <alpha-value>)",
        },
        success: "rgb(var(--color-bull) / <alpha-value>)",
        danger: "rgb(var(--color-bear) / <alpha-value>)",
        warning: "rgb(var(--color-neutral) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        sentiment: {
          bull: "rgb(var(--color-bull) / <alpha-value>)",
          "bull-bg": "rgb(var(--color-bull) / 0.10)",
          "bull-border": "rgb(var(--color-bull) / 0.60)",
          bear: "rgb(var(--color-bear) / <alpha-value>)",
          "bear-bg": "rgb(var(--color-bear) / 0.10)",
          "bear-border": "rgb(var(--color-bear-border) / 0.60)",
          neutral: "rgb(var(--color-neutral) / <alpha-value>)",
          "neutral-bg": "rgb(var(--color-neutral) / 0.10)",
          "neutral-border": "rgb(var(--color-neutral-border) / 0.60)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },
      boxShadow: {
        "card-subtle": "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glow: "var(--glow-brand)",
        "glow-accent": "var(--glow-accent)",
        "glow-brand": "var(--glow-brand)",
        "glow-cyan": "var(--glow-cyan)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "SF Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
