import type { Config } from 'tailwindcss'
import * as defaultTheme from 'tailwindcss/defaultTheme'
console.log(defaultTheme.fontFamily)
const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    fontFamily: {
      sans: ['"Avenir Next"', ...defaultTheme.fontFamily.sans],
    },
  },
  plugins: [],
}
export default config
