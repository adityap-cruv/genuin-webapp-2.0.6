import { type Config } from 'tailwindcss'
import * as defaultTheme from 'tailwindcss/defaultTheme'
module.exports = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
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
      transparent: {
        DEFAULT: 'transparent',
      },
      blue: {
        DEFAULT: '#0645FF',
        10: '#092087',
        20: '#072EBE',
        30: '#0645FF',
        40: '#1D6AFF',
        50: '#3F91FF',
        60: '#6DB5FF',
        70: '#A2D3FF',
        80: '#D1E5FA',
        90: '#CDDAFF',
      },
      monochrome: {
        white: '#FFFFFF',
        11: '#F9F9F9',
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
      new: {
        'off-black': '#16171A',
        'off-white': '#F8F8F8',
        'dark-grey': '#3F3F3F',
        'light-grey': '#BBB',
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
      // New Typography developed by design team for new web.
      'title-1-bold': ['24px', { fontWeight: 700, lineHeight: '32px' }],
      'title-2-bold': ['20px', { fontWeight: 700, lineHeight: '32px' }],
      'title-2-demi': ['20px', { fontWeight: 600, lineHeight: '32px' }],
      'title-3-bold': ['17px', { fontWeight: 700, lineHeight: '24px' }],
      'title-3-demi': ['17px', { fontWeight: 600, lineHeight: '24px' }],
      'title-3-med': ['17px', { fontWeight: 500, lineHeight: '24px' }],
      'body-1-bold': ['15px', { fontWeight: 700, lineHeight: '20px' }],
      'body-1-demi': ['15px', { fontWeight: 600, lineHeight: '20px' }],
      'body-1-med': ['15px', { fontWeight: 500, lineHeight: '20px' }],
      'cap-1-bold': ['12px', { fontWeight: 700, lineHeight: '16px' }],
      'cap-1-demi': ['12px', { fontWeight: 600, lineHeight: '16px' }],
      'cap-1-med': ['12px', { fontWeight: 500, lineHeight: '16px' }],
      // This typography is only used for index page.
      'new-h1': ['60px', { fontWeight: 700, lineHeight: '110%', letterSpacing: '-1.8px' }],
      'new-h2': ['48px', { fontWeight: 700, lineHeight: '110%', letterSpacing: '-1.44px' }],
      'new-h3': ['40px', { fontWeight: 700, lineHeight: '110%', letterSpacing: '-1.2px' }],
      'new-h4': ['28px', { fontWeight: 600, lineHeight: '120%', letterSpacing: '-0.84px' }],
      'new-h5': ['24px', { fontWeight: 500, lineHeight: '120%', letterSpacing: '-0.72px' }],
      'new-para-1': ['20px', { fontWeight: 500, lineHeight: '120%', letterSpacing: '-0.6px' }],
      'new-para-2': ['16px', { fontWeight: 500, lineHeight: '120%', letterSpacing: '-0.48px' }],
      'new-h1-mobile': ['40px', { fontWeight: 700, lineHeight: '110%', letterSpacing: '-1.2px' }],
      'new-h2-mobile': ['32px', { fontWeight: 700, lineHeight: '120%', letterSpacing: '-0.96px' }],
      'new-h3-mobile': ['28px', { fontWeight: 700, lineHeight: '120%', letterSpacing: '-0.84px' }],
      'new-h4-mobile': ['24px', { fontWeight: 700, lineHeight: '110%', letterSpacing: '-0.72px' }],
      'new-h5-mobile': ['20px', { fontWeight: 500, lineHeight: '120%', letterSpacing: '-0.6px' }],
      'new-para-1-mobile': ['16px', { fontWeight: 500, lineHeight: '125%', letterSpacing: '-0.6px' }],
      'new-para-2-mobile': ['12px', { fontWeight: 500, lineHeight: '110%', letterSpacing: '-0.36px' }],
      'new-sm': ['16px', { fontWeight: 500, lineHeight: '120%', letterSpacing: '-0.48px' }],
      'new-md': ['20px', { fontWeight: 500, lineHeight: '120%', letterSpacing: '-0.6px' }],
      'new-lg': ['24px', { fontWeight: 500, lineHeight: '120%', letterSpacing: '-0.72px' }],
    },
    fontFamily: {
      sans: ['"Avenir Next"', ...defaultTheme.fontFamily.sans], // Here sans is default font in tailwindcss so updated it to avenir next
    },
    aspectRatio: {
      reel: '9 / 16',
    },
    extend: {
      height: {
        body: 'calc(100% - 74px)',
        navbar: '74px',
      },
      flexGrow: {
        3: '3',
        4: '4',
        5: '5',
        6: '6',
        9: '9',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
        },
        screens: {
          lg: '992px',
          xl: '1200px',
          '2xl': '1400px',
        },
      },
      screens: {
        lg: '1074px',
      },
      margin: {
        body: '74px',
        15: '3.75rem',
      },
      spacing: {
        navbar: '74px',
      },
      listStyleType: {
        lower: 'lower-alpha',
        'lower-roman': 'lower-roman',
      },
      minWidth: {
        tablet: '768px',
        lg: '1074px',
      },
      maxWidth: {
        1440: '1440px',
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      linearGradientColors: {
        'black-70': ['rgba(17, 17, 17, 0.00)', 'rgba(17, 17, 17, 0.70)'],
      },
      letterSpacing: {},
    },
  },
  plugins: [require('tailwindcss-animate')],
} as Config
