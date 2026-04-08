import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Ethereal Glow Design Tokens (Stitch MCP authority) ──────────
      colors: {
        // Raw design tokens
        'background-dark': '#0A0E14',
        'surface-dark': '#151922',
        'background-light': '#f8f7f6',
        primary: {
          DEFAULT: '#E67E22',
          hover: '#D35400',
          foreground: '#FFFFFF',
        },
        'accent-amber': '#F39C12',
        'gold-border': '#8C6A43',
        'text-high': '#FFFFFF',
        'text-medium': '#D1D1D1',
        'text-low': '#8E8E8E',

        // shadcn/ui CSS variable bridges
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },

      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      boxShadow: {
        glow: '0 0 25px rgba(230, 126, 34, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-hover': '0 0 30px rgba(230, 126, 34, 0.6)',
        card: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
      },

      backgroundImage: {
        'button-gradient': 'linear-gradient(135deg, #E67E22 0%, #F1C40F 100%)',
        'fire-glow': 'radial-gradient(circle at center, rgba(230, 126, 34, 0.15) 0%, rgba(10, 14, 20, 0) 70%)',
      },

      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [animate],
}

export default config
