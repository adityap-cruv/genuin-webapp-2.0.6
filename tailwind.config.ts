import type { Config } from 'tailwindcss'
import * as defaultTheme from 'tailwindcss/defaultTheme'
const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {
      blue: {
        primary: '#0645FF',
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
        5: '#949494',
        4: '#707070',
        3: '#4D4D4D',
        2: '#353535',
        black: '#111111',
      },
      red: {
        primary: '#F2545B',
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
      screens: {
        mobile: { min: '280px', max: '640px' },
        tablet: { min: '640px', max: '1024px' },
        laptop: { min: '1024px', max: '1280px' },
        desktop: { min: '1280px' },
      },
    },
  },
  plugins: [],
}
export default config
