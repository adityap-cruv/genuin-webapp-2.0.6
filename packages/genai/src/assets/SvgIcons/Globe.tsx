import type { SVGProps } from 'react';

const Globe = (props: SVGProps<SVGSVGElement>) => (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path
            d='M9.99911 18.6252C14.7621 18.6252 18.6232 14.7641 18.6232 10.0011C18.6232 5.2381 14.7621 1.37695 9.99911 1.37695C5.23615 1.37695 1.375 5.2381 1.375 10.0011C1.375 14.7641 5.23615 18.6252 9.99911 18.6252Z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <path
            d='M1.375 10H18.6232'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
        <path
            d='M13.3175 10.0011C13.1546 13.1548 11.993 16.175 10.0006 18.6252C8.00815 16.175 6.84652 13.1548 6.68359 10.0011C6.84652 6.8473 8.00815 3.82706 10.0006 1.37695C11.993 3.82706 13.1546 6.8473 13.3175 10.0011Z'
            stroke='currentColor'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
        />
    </svg>
);
export default Globe;
