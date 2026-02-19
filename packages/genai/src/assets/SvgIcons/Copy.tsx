import type { SVGProps } from 'react';

const Copy = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor' {...props}>
            <path
                d='M13.3346 0.833984H3.33464C2.41797 0.833984 1.66797 1.58398 1.66797 2.50065V14.1673H3.33464V2.50065H13.3346V0.833984ZM15.8346 4.16732H6.66797C5.7513 4.16732 5.0013 4.91732 5.0013 5.83398V17.5007C5.0013 18.4173 5.7513 19.1673 6.66797 19.1673H15.8346C16.7513 19.1673 17.5013 18.4173 17.5013 17.5007V5.83398C17.5013 4.91732 16.7513 4.16732 15.8346 4.16732ZM15.8346 17.5007H6.66797V5.83398H15.8346V17.5007Z'
                fill='currentColor'
            />
        </svg>
    );
};

export default Copy;
