import type { Config } from 'tailwindcss'
import * as defaultTheme from 'tailwindcss/defaultTheme'
const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    colors: {},
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
