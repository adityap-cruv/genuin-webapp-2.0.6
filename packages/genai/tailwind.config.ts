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
            animation: {
                shimmer: 'shimmer 2.5s ease-in-out infinite',
                'fade-in': 'fade-in 0.2s ease-out both',
                'slide-down': 'slide-down 0.25s ease-out both',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-down': {
                    '0%': { opacity: '0', transform: 'translateY(-6px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
};

export default config;
