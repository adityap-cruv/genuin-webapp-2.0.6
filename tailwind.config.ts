import * as defaultTheme from 'tailwindcss/defaultTheme'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        blue: {
          DEFAULT: '#0645FF',
          10: '#CDDAFF',
          20: '#D1E5FA',
          30: '#A2D3FF',
          40: '#6DB5FF',
          50: '#3F91FF',
          60: '#1D6AFF',
          70: '#1D6AFF',
          80: '#072EBE',
          90: '#092087',
        },
        monochrome: {
          white: '#FFFFFF',
          10: '#F3F3F3',
          9: '#E7E7E7',
          8: '#DBDBDB',
          7: '#C3C3C3',
          6: '#ACACAC',
          DEFAULT: '#949494',
          4: '#707070',
          3: '#4D4D4D',
          2: '#353535',
          black: '#111111',
        },
        red: {
          DEFAULT: '#F2545B',
          10: '#FFF0F0',
          20: '#FFDCDC',
          30: '#FFC8C8',
          40: '#FFA0A0',
          50: '#F87878',
        },
        supplementary: {
          blue: '#0645FF',
          green: '#77CE1A',
          yellow: '#FFBF00',
          red: '#F94740',
        },
        // border: 'hsl(var(--border))',
        // input: 'hsl(var(--input))',
        // ring: 'hsl(var(--ring))',
        // destructive: {
        //   DEFAULT: 'hsl(var(--destructive))',
        //   foreground: 'hsl(var(--destructive-foreground))',
        // },
        // muted: {
        //   DEFAULT: 'hsl(var(--muted))',
        //   foreground: 'hsl(var(--muted-foreground))',
        // },
        // accent: {
        //   DEFAULT: 'hsl(var(--accent))',
        //   foreground: 'hsl(var(--accent-foreground))',
        // },
        // popover: {
        //   DEFAULT: 'hsl(var(--popover))',
        //   foreground: 'hsl(var(--popover-foreground))',
        // },
        // card: {
        //   DEFAULT: 'hsl(var(--card))',
        //   foreground: 'hsl(var(--card-foreground))',
        // },
      },
      fontSize: {
        'title-sm': ['0.9375rem', { fontWeight: 700, lineHeight: '1.25rem' }], // 15px
        'title-md': ['1.0625rem', { fontWeight: 700, lineHeight: '1.5rem' }], // 17px
        'title-lg': ['1.25rem', { fontWeight: 700, lineHeight: '2rem' }], // 20px
        'title-xl': ['1.5rem', { fontWeight: 700, lineHeight: '2rem' }], // 24px
        'body-sm': ['0.9375rem', { fontWeight: 600, lineHeight: '1.25rem' }], // 15px
        'body-lg': ['1.0625rem', { fontWeight: 600, lineHeight: '1.5rem' }], // 17px
        'cap-bold-sm': ['0.625rem', { fontWeight: 700, lineHeight: '1rem' }], // 10px
        'cap-bold-lg': ['0.75rem', { fontWeight: 700, lineHeight: '1rem' }], // 12px
        'cap-sm': ['0.625rem', { fontWeight: 600, lineHeight: '1rem' }],
        'cap-lg': ['0.75rem', { fontWeight: 600, lineHeight: '1rem' }],
      },
      fontFamily: {
        sans: ['"Avenir Next"', ...defaultTheme.fontFamily.sans], // Here sans is default font in tailwindcss so updated it to avenir next
      },
      container: {
        center: true,
        screens: {
          mobile: { min: '280px', max: '640px' },
          tablet: { min: '640px', max: '1024px' },
          laptop: { min: '1024px', max: '1280px' },
          desktop: { min: '1280px' },
        },
      },
      // borderRadius: {
      //   lg: 'var(--radius)',
      //   md: 'calc(var(--radius) - 2px)',
      //   sm: 'calc(var(--radius) - 4px)',
      // },
      // keyframes: {
      //   'accordion-down': {
      //     from: { height: 0 },
      //     to: { height: 'var(--radix-accordion-content-height)' },
      //   },
      //   'accordion-up': {
      //     from: { height: 'var(--radix-accordion-content-height)' },
      //     to: { height: 0 },
      //   },
      // },
      // animation: {
      //   'accordion-down': 'accordion-down 0.2s ease-out',
      //   'accordion-up': 'accordion-up 0.2s ease-out',
      // },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
