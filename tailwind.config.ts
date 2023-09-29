import { Config } from 'tailwindcss'
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
      'title-sm': ['15px', { fontWeight: 700, lineHeight: '20px' }], // 15px
      'title-md': ['17px', { fontWeight: 700, lineHeight: '24px' }], // 17px
      'title-lg': ['20px', { fontWeight: 700, lineHeight: '32px' }], // 20px
      'title-xl': ['24px', { fontWeight: 700, lineHeight: '32px' }], // 24px
      'body-sm': ['15px', { fontWeight: 600, lineHeight: '20px' }], // 15px
      'body-lg': ['17px', { fontWeight: 600, lineHeight: '20px' }], // 17px
      'cap-bold-sm': ['10px', { fontWeight: 700, lineHeight: '16px' }], // 10px
      'cap-bold-lg': ['12px', { fontWeight: 700, lineHeight: '16px' }], // 12px
      'cap-sm': ['10px', { fontWeight: 600, lineHeight: '16px' }],
      'cap-lg': ['12px', { fontWeight: 600, lineHeight: '16px' }],
    },
    fontFamily: {
      sans: ['"Avenir Next"', ...defaultTheme.fontFamily.sans], // Here sans is default font in tailwindcss so updated it to avenir next
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '0rem',
        md: '1rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
    },
    aspectRatio: {
      reel: '9 / 16',
    },
    extend: {
      height: {
        body: 'calc(100% - 74px)',
        navbar: '74px',
      },
      margin: {
        body: '74px',
      },
      spacing: {
        navbar: '74px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} as Config
