import type { SVGProps } from 'react';

const ArrowUpward = (props: SVGProps<SVGSVGElement>) => (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path d='M10.0013 17.5L10.0013 2.5' stroke='white' strokeWidth='1.875' strokeLinecap='round' />
        <path
            d='M5 7.5L9.70537 2.79463C9.86809 2.63191 10.1319 2.63191 10.2946 2.79463L15 7.5'
            stroke='white'
            strokeWidth='1.875'
            strokeLinecap='round'
        />
    </svg>
);

export default ArrowUpward;
