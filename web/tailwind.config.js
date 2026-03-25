/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        public: ['Outfit', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        publicBlob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(5%, 4%) scale(1.06)' },
          '66%': { transform: 'translate(-4%, 3%) scale(0.94)' },
        },
        homeMarquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        homeShimmer: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)', opacity: '0' },
          '40%': { opacity: '0.35' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)', opacity: '0' },
        },
        homePulseSoft: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.75', transform: 'scale(1.03)' },
        },
        homeSpinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        homeGridDrift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '48px 48px' },
        },
        homeGradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        homeFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        homeChevron: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
      },
      animation: {
        'public-blob': 'publicBlob 20s ease-in-out infinite',
        'public-blob-delayed': 'publicBlob 24s ease-in-out infinite -6s',
        'home-marquee': 'homeMarquee 38s linear infinite',
        'home-marquee-rev': 'homeMarquee 44s linear infinite reverse',
        'home-shimmer': 'homeShimmer 4.5s ease-in-out infinite',
        'home-pulse-soft': 'homePulseSoft 5s ease-in-out infinite',
        'home-spin-slow': 'homeSpinSlow 48s linear infinite',
        'home-grid-drift': 'homeGridDrift 80s linear infinite',
        'home-gradient-x': 'homeGradientX 10s ease infinite',
        'home-float': 'homeFloat 5.5s ease-in-out infinite',
        'home-chevron': 'homeChevron 1.8s ease-in-out infinite',
      },
      backgroundSize: {
        'gradient-wide': '200% 200%',
      },
      colors: {
        /* ── Design System: 3 main colors ── */
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        success: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          50:  '#FFFBEB',
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
        /* ── Existing semantic tokens ── */
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'input-background': 'var(--input-background)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
