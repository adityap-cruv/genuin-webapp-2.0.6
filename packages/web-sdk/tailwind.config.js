import * as defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,tsx}'],
  darkMode: ['class'],
  prefix: '',
  blocklist: [],
  corePlugins: {
    preflight: true,
  },
  // This will ensure that generated classes are only applied to the elements which are included in class `gen-sdk-class`.
  important: '.gen-sdk-class',
  theme: {
    fontSize: {
      'heading-3': [
        '32px !important',
        {
          fontWeight: '600 !important',
          lineHeight: '120% !important',
          letterSpacing: '-0.96px !important',
        },
      ],
      'title-1-bold': [
        '24px !important',
        { fontWeight: '700 !important', lineHeight: '32px !important' },
      ],
      'title-1-demi': [
        '24px !important',
        { fontWeight: '600 !important', lineHeight: '32px !important' },
      ],
      'title-1-med': [
        '24px !important',
        { fontWeight: '500 !important', lineHeight: '32px !important' },
      ],
      'title-2-bold': [
        '20px !important',
        { fontWeight: '700 !important', lineHeight: '32px !important' },
      ],
      'title-2-demi': [
        '20px !important',
        { fontWeight: '600 !important', lineHeight: '32px !important' },
      ],
      'title-3-bold': [
        '17px !important',
        { fontWeight: '700 !important', lineHeight: '24px !important' },
      ],
      'title-3-demi': [
        '17px !important',
        { fontWeight: '600 !important', lineHeight: '24px !important' },
      ],
      'title-3-med': [
        '17px !important',
        { fontWeight: '500 !important', lineHeight: '24px !important' },
      ],
      'body-1-bold': [
        '15px !important',
        { fontWeight: '700 !important', lineHeight: '20px !important' },
      ],
      'body-1-demi': [
        '15px !important',
        { fontWeight: '600 !important', lineHeight: '20px !important' },
      ],
      'body-1-med': [
        '15px !important',
        { fontWeight: '500 !important', lineHeight: '20px !important' },
      ],
      'cap-1-bold': [
        '12px !important',
        { fontWeight: '700 !important', lineHeight: '16px !important' },
      ],
      'cap-1-demi': [
        '12px !important',
        { fontWeight: '600 !important', lineHeight: '16px !important' },
      ],
      'cap-1-med': [
        '12px !important',
        { fontWeight: '500 !important', lineHeight: '16px !important' },
      ],
      'cap-2-demi': [
        '10px !important',
        { fontWeight: '600 !important', lineHeight: '16px !important' },
      ],
      'new-para-2': [
        '16px !important',
        {
          fontWeight: '500 !important',
          lineHeight: '120% !important',
          letterSpacing: '-0.48px !important',
        },
      ],
      'new-para-2-mobile': [
        '12px !important',
        {
          fontWeight: '500 !important',
          lineHeight: '110% !important',
          letterSpacing: '-0.36px !important',
        },
      ],
    },
    maxWidth: {
      // Convert default rem values to px (1rem = 16px)
      0: '0px !important', // 0rem → 0px
      none: 'none !important', // No max-width
      xs: '320px !important', // 20rem → 320px
      sm: '384px !important', // 24rem → 384px
      md: '448px !important', // 28rem → 448px
      lg: '512px !important', // 32rem → 512px
      xl: '576px !important', // 36rem → 576px
      '2xl': '672px !important', // 42rem → 672px
      '3xl': '768px !important', // 48rem → 768px
      '4xl': '896px !important', // 56rem → 896px
      '5xl': '1024px !important', // 64rem → 1024px
      '6xl': '1152px !important', // 72rem → 1152px
      '7xl': '1280px !important', // 80rem → 1280px
      full: '100% !important', // No conversion needed
      min: 'min-content !important', // No conversion needed
      max: 'max-content !important', // No conversion needed
      fit: 'fit-content !important', // No conversion needed
      prose: '65ch !important', // No conversion needed (based on character count)
    },
    lineHeight: {
      // Convert default rem values to px (1rem = 16px)
      none: '1 !important', // Unitless (no conversion needed)
      tight: '20px !important', // 1.25rem → 20px
      snug: '22px !important', // 1.375rem → 22px
      normal: '24px !important', // 1.5rem → 24px
      relaxed: '26px !important', // 1.625rem → 26px
      loose: '32px !important', // 2rem → 32px
      // Custom values (optional)
      3: '12px !important', // 0.75rem → 12px
      4: '16px !important', // 1rem → 16px
      5: '20px !important', // 1.25rem → 20px
      6: '24px !important', // 1.5rem → 24px
      7: '28px !important', // 1.75rem → 28px
      8: '32px !important', // 2rem → 32px
      9: '36px !important', // 2.25rem → 36px
      10: '40px !important', // 2.5rem → 40px
    },
    borderRadius: {
      // Convert default rem values to px (1rem = 16px)
      none: '0px !important',
      sm: '2px !important', // 0.125rem → 2px
      DEFAULT: '4px !important', // 0.25rem  → 4px (used for `rounded`)
      md: '6px !important', // 0.375rem → 6px
      lg: '8px !important', // 0.5rem   → 8px
      xl: '12px !important', // 0.75rem  → 12px
      '2xl': '16px !important', // 1rem     → 16px
      '3xl': '24px !important', // 1.5rem   → 24px
      full: '9999px !important', // Unchanged (already px-based)
    },
    spacing: {
      // Hardcoded px values (1 unit = 4px instead of 0.25rem)
      0: '0px !important',
      px: '1px !important',
      0.5: '2px !important', // 0.125rem → 2px
      1: '4px !important', // 0.25rem  → 4px
      1.5: '6px !important', // 0.375rem → 6px
      2: '8px !important', // 0.5rem   → 8px
      2.5: '10px !important', // 0.625rem → 10px
      3: '12px !important', // 0.75rem  → 12px
      3.5: '14px !important', // 0.875rem → 14px
      4: '16px !important', // 1rem     → 16px
      5: '20px !important', // 1.25rem  → 20px
      6: '24px !important', // 1.5rem   → 24px
      7: '28px !important', // 1.75rem  → 28px
      8: '32px !important', // 2rem     → 32px
      9: '36px !important', // 2.25rem  → 36px
      10: '40px !important', // 2.5rem   → 40px
      11: '44px !important', // 2.75rem  → 44px
      12: '48px !important', // 3rem     → 48px
      14: '56px !important', // 3.5rem   → 56px
      16: '64px !important', // 4rem     → 64px
      20: '80px !important', // 5rem     → 80px
      24: '96px !important', // 6rem     → 96px
      28: '112px !important', // 7rem     → 112px
      32: '128px !important', // 8rem     → 128px
      36: '144px !important', // 9rem     → 144px
      40: '160px !important', // 10rem    → 160px
      44: '176px !important', // 11rem    → 176px
      48: '192px !important', // 12rem    → 192px
      52: '208px !important', // 13rem    → 208px
      56: '224px !important', // 14rem    → 224px
      60: '240px !important', // 15rem    → 240px
      64: '256px !important', // 16rem    → 256px
      72: '288px !important', // 18rem    → 288px
      80: '320px !important', // 20rem    → 320px
      96: '384px !important', // 24rem    → 384px
    },
    fontFamily: {
      sans: ['"Avenir Next"', ...defaultTheme.fontFamily.sans], // Here sans is default font in tailwindcss so updated it to avenir next
      // manrope: ['"Manrope"', ...defaultTheme.fontFamily.sans],
    },
    aspectRatio: {
      reel: '9/16 !important',
      animatedDiv: '11/10 !important',
      square: '1/1 !important',
    },
    width: {
      0: '0px !important',
      full: '100%',
      min: 'min-content !important',
      fit: 'fit-content !important',
      auto: 'auto !important',
      '1/2': '50% !important',
      '1/3': '33.333% !important',
      '2/3': '66.666% !important',
      '1/4': '25% !important',
      '3/4': '75% !important',
      '1/5': '20% !important',
      '2/5': '40% !important',
      '3/5': '60% !important',
      '4/5': '80% !important',
      '1/6': '16.666% !important',
      '5/6': '83.333% !important',
      '1/12': '8.333% !important',
      '11/12': '91.666% !important',
      '-full': '-100% !important',
      '-1/2': '-50% !important',
      '-1/3': '-33.333% !important',
      '-2/3': '-66.666% !important',
      '-1/4': '-25% !important',
      '-3/4': '-75% !important',
      '-1/5': '-20% !important',
      '-2/5': '-40% !important',
      '-3/5': '-60% !important',
      '-4/5': '-80% !important',
      '-1/6': '-16.666% !important',
      '-5/6': '-83.333% !important',
      '-1/12': '-8.333% !important',
      '-11/12': '-91.666% !important',
      px: '1px !important',
      0.5: '2px !important', // 0.125rem → 2px
      1: '4px !important', // 0.25rem  → 4px
      1.5: '6px !important', // 0.375rem → 6px
      2: '8px !important', // 0.5rem   → 8px
      2.5: '10px !important', // 0.625rem → 10px
      3: '12px !important', // 0.75rem  → 12px
      3.5: '14px !important', // 0.875rem → 14px
      4: '16px !important', // 1rem     → 16px
      5: '20px !important', // 1.25rem  → 20px
      6: '24px !important', // 1.5rem   → 24px
      7: '28px !important', // 1.75rem  → 28px
      8: '32px !important', // 2rem     → 32px
      9: '36px !important', // 2.25rem  → 36px
      10: '40px !important', // 2.5rem   → 40px
      11: '44px !important', // 2.75rem  → 44px
      12: '48px !important', // 3rem     → 48px
      14: '56px !important', // 3.5rem   → 56px
      16: '64px !important', // 4rem     → 64px
      20: '80px !important', // 5rem     → 80px
      24: '96px !important', // 6rem     → 96px
      28: '112px !important', // 7rem     → 112px
      32: '128px !important', // 8rem     → 128px
      36: '144px !important', // 9rem     → 144px
      40: '160px !important', // 10rem    → 160px
      44: '176px !important', // 11rem    → 176px
      48: '192px !important', // 12rem    → 192px
      52: '208px !important', // 13rem    → 208px
      56: '224px !important', // 14rem    → 224px
      60: '240px !important', // 15rem    → 240px
      64: '256px !important', // 16rem    → 256px
      72: '288px !important', // 18rem    → 288px
      80: '320px !important', // 20rem    → 320px
      96: '384px !important', // 24rem    → 384px
    },
    translate: {
      0: '0px !important',
      px: '1px !important',
      0.5: '2px !important', // 0.125rem → 2px
      1: '4px !important', // 0.25rem  → 4px
      1.5: '6px !important', // 0.375rem → 6px
      2: '8px !important', // 0.5rem   → 8px
      2.5: '10px !important', // 0.625rem → 10px
      3: '12px !important', // 0.75rem  → 12px
      3.5: '14px !important', // 0.875rem → 14px
      4: '16px !important', // 1rem     → 16px
      5: '20px !important', // 1.25rem  → 20px
      6: '24px !important', // 1.5rem   → 24px
      7: '28px !important', // 1.75rem  → 28px
      8: '32px !important', // 2rem     → 32px
      9: '36px !important', // 2.25rem  → 36px
      10: '40px !important', // 2.5rem   → 40px
      11: '44px !important', // 2.75rem  → 44px
      12: '48px !important', // 3rem     → 48px
      14: '56px !important', // 3.5rem   → 56px
      16: '64px !important', // 4rem     → 64px
      20: '80px !important', // 5rem     → 80px
      24: '96px !important', // 6rem     → 96px
      28: '112px !important', // 7rem     → 112px
      32: '128px !important', // 8rem     → 128px
      36: '144px !important', // 9rem     → 144px
      40: '160px !important', // 10rem    → 160px
      44: '176px !important', // 11rem    → 176px
      48: '192px !important', // 12rem    → 192px
      52: '208px !important', // 13rem    → 208px
      56: '224px !important', // 14rem    → 224px
      60: '240px !important', // 15rem    → 240px
      64: '256px !important', // 16rem    → 256px
      72: '288px !important', // 18rem    → 288px
      80: '320px !important', // 20rem    → 320px
      96: '384px !important', // 24rem    → 384px
      full: '100%',
      '1/2': '50% !important',
      '1/3': '33.333% !important',
      '2/3': '66.666% !important',
      '1/4': '25% !important',
      '3/4': '75% !important',
      '1/5': '20% !important',
      '2/5': '40% !important',
      '3/5': '60% !important',
      '4/5': '80% !important',
      '1/6': '16.666% !important',
      '5/6': '83.333% !important',
      '1/12': '8.333% !important',
      '11/12': '91.666% !important',
      '-full': '-100% !important',
      '-1/2': '-50% !important',
      '-1/3': '-33.333% !important',
      '-2/3': '-66.666% !important',
      '-1/4': '-25% !important',
      '-3/4': '-75% !important',
      '-1/5': '-20% !important',
      '-2/5': '-40% !important',
      '-3/5': '-60% !important',
      '-4/5': '-80% !important',
      '-1/6': '-16.666% !important',
      '-5/6': '-83.333% !important',
      '-1/12': '-8.333% !important',
      '-11/12': '-91.666% !important',
    },
    inset: {
      0: '0px',
      full: '100%',
      auto: 'auto',
      '1/2': '50% !important',
      '1/3': '33.333% !important',
      '2/3': '66.666% !important',
      '1/4': '25% !important',
      '3/4': '75% !important',
      '1/5': '20% !important',
      '2/5': '40% !important',
      '3/5': '60% !important',
      '4/5': '80% !important',
      '1/6': '16.666% !important',
      '5/6': '83.333% !important',
      '1/12': '8.333% !important',
      '11/12': '91.666% !important',
      '-full': '-100% !important',
      '-1/2': '-50% !important',
      '-1/3': '-33.333% !important',
      '-2/3': '-66.666% !important',
      '-1/4': '-25% !important',
      '-3/4': '-75% !important',
      '-1/5': '-20% !important',
      '-2/5': '-40% !important',
      '-3/5': '-60% !important',
      '-4/5': '-80% !important',
      '-1/6': '-16.666% !important',
      '-5/6': '-83.333% !important',
      '-1/12': '-8.333% !important',
      '-11/12': '-91.666% !important',
      px: '1px !important',
      0.5: '2px !important', // 0.125rem → 2px
      1: '4px !important', // 0.25rem  → 4px
      1.5: '6px !important', // 0.375rem → 6px
      2: '8px !important', // 0.5rem   → 8px
      2.5: '10px !important', // 0.625rem → 10px
      3: '12px !important', // 0.75rem  → 12px
      3.5: '14px !important', // 0.875rem → 14px
      4: '16px !important', // 1rem     → 16px
      5: '20px !important', // 1.25rem  → 20px
      6: '24px !important', // 1.5rem   → 24px
      7: '28px !important', // 1.75rem  → 28px
      8: '32px !important', // 2rem     → 32px
      9: '36px !important', // 2.25rem  → 36px
      10: '40px !important', // 2.5rem   → 40px
      11: '44px !important', // 2.75rem  → 44px
      12: '48px !important', // 3rem     → 48px
      14: '56px !important', // 3.5rem   → 56px
      '-14': '-56px !important', // 3.5rem   → 56px
      16: '64px !important', // 4rem     → 64px
      20: '80px !important', // 5rem     → 80px
      24: '96px !important', // 6rem     → 96px
      28: '112px !important', // 7rem     → 112px
      32: '128px !important', // 8rem     → 128px
      36: '144px !important', // 9rem     → 144px
      40: '160px !important', // 10rem    → 160px
      44: '176px !important', // 11rem    → 176px
      48: '192px !important', // 12rem    → 192px
      52: '208px !important', // 13rem    → 208px
      56: '224px !important', // 14rem    → 224px
      60: '240px !important', // 15rem    → 240px
      64: '256px !important', // 16rem    → 256px
      72: '288px !important', // 18rem    → 288px
      80: '320px !important', // 20rem    → 320px
      96: '384px !important', // 24rem    → 384px
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary) !important',
          foreground: 'hsl(var(--primary-foreground)) !important',
          100: 'var(--primary-100) !important',
          200: 'var(--primary-200) !important',
          300: 'var(--primary-300) !important',
          400: 'var(--primary-400) !important',
          500: 'var(--primary-500) !important',
          600: 'var(--primary-600) !important',
          700: 'var(--primary-700) !important',
        },
        secondary: {
          DEFAULT: 'var(--secondary) !important',
          foreground: 'hsl(var(--secondary-foreground)) !important',
          300: 'var(--secondary-300) !important',
          400: 'var(--secondary-400) !important',
          600: 'var(--secondary-600) !important',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary) !important',
          100: 'var(--tertiary-100) !important',
          200: 'var(--tertiary-200) !important',
          300: 'var(--tertiary-300) !important',
          400: 'var(--tertiary-400) !important',
        },
        background: {
          DEFAULT: 'var(--background) !important',
        },
        foreground: {
          DEFAULT: 'var(--foreground) !important',
        },
      },
      keyframes: {
        fadeOutDelay: {
          '0%': { opacity: '1' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'fade-out-delay': 'fadeOutDelay 2s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
