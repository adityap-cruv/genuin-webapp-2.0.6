import type { SVGProps } from 'react';

const Share = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
            <path
                d='M10.975 16.047L18.125 9.5865L10.975 3.12598V7.47826H9.09722C5.125 7.47826 1.875 10.6486 1.875 14.3208L1.875 15.8429C1.875 16.047 2.09167 16.251 2.30833 16.251H2.38056C2.525 16.251 2.66944 16.115 2.74167 15.979C3.5 14.1085 4.3125 11.8306 9.09722 11.8306H10.975V16.047Z'
                stroke='currentColor'
                strokeWidth='1.25'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default Share;
