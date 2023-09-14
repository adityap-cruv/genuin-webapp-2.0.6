import type { Config } from 'tailwindcss'
import * as defaultTheme from 'tailwindcss/defaultTheme'
const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      lottie: {
        'red-orange': '#EB6D4A',
        'yellow-orange': '#FEA328',
        yellow: '#FEC62E',
        blue: '#1382CA',
        'cyan-blue': '#4A9BBF',
        cyan: '#54C8E8',
        'bright-blue': '#8DC6E8',
        'light-blue': '#D6EAFC',
        'bottle-green': '#A4E6DA',
        maroon: '#A576A6',
        purple: '#A482C6',
      },
      blue: {
        official: '#0645FF',
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
        20: '#E7E7E7',
        30: '#DBDBDB',
        40: '#C3C3C3',
        50: '#ACACAC',
        60: '#949494',
        70: '#707070',
        80: '#4D4D4D',
        90: '#353535',
        black: '#111111',
      },
      red: {
        official: '#F2545B',
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
    },
    fontSize: {
      'title-sm': ['0.9375rem', { fontWeight: 700, lineHeight: '1.25rem' }],
      'title-md': ['1.0625rem', { fontWeight: 700, lineHeight: '1.5rem' }],
      'title-lg': ['1.25rem', { fontWeight: 700, lineHeight: '2rem' }],
      'title-xl': ['1.5rem', { fontWeight: 700, lineHeight: '2rem' }],
      'body-sm': ['0.9375rem', { fontWeight: 600, lineHeight: '1.25rem' }],
      'body-lg': ['1.0625rem', { fontWeight: 600, lineHeight: '1.5rem' }],
      'cap-bold-sm': ['0.625rem', { fontWeight: 700, lineHeight: '1rem' }],
      'cap-bold-lg': ['0.75rem', { fontWeight: 700, lineHeight: '1rem' }],
      'cap-sm': ['0.625rem', { fontWeight: 600, lineHeight: '1rem' }],
      'cap-lg': ['0.75rem', { fontWeight: 600, lineHeight: '1rem' }],
    },
    fontFamily: {
      sans: ['"Avenir Next"', ...defaultTheme.fontFamily.sans], // Here sans is default font in tailwindcss so updated it to avenir next
    },
  },
  plugins: [],
}
export default config
