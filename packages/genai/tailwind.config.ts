import type { Config } from 'tailwindcss';

const config: Config = {
    prefix: 'gai:',
    important: true,
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            borderRadius: {
                sm: '6px',
                DEFAULT: '10px',
                md: '8px',
                lg: '10px',
                xl: '14px',
                '2xl': '16px',
                '3xl': '24px', // This ensures gai:rounded-3xl is always 24px
            },
        },
    },
};

export default config;
