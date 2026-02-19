import type { SVGProps } from 'react';

const Freehand = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
            <g clip-path='url(#clip0_185_99682)'>
                <path
                    d='M2.98338 2.23828C3.86017 3.4227 5.23536 4.7668 4.36749 7.37038C3.39915 10.2754 0.497894 12.9056 3.69937 15.1552'
                    stroke='currentColor'
                    stroke-width='1.25'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                />
                <path
                    d='M6.84858 9.60459L5.78843 16.3188C5.72793 16.7021 6.05876 17.0328 6.442 16.9724L13.1562 15.9123C13.6649 15.8319 14.057 15.4214 14.1139 14.9095L14.4571 11.8202L10.9406 8.30371L7.85124 8.64697C7.33945 8.70384 6.92889 9.09595 6.84858 9.60459Z'
                    stroke='currentColor'
                    stroke-width='1.25'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                />
                <path
                    d='M10.9375 8.30435L12.6958 5.66699'
                    stroke='currentColor'
                    stroke-width='1.25'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                />
                <path
                    d='M14.4531 11.8207L17.0905 10.0625'
                    stroke='currentColor'
                    stroke-width='1.25'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                />
                <path
                    d='M6.10156 16.6561L9.61804 13.1396'
                    stroke='currentColor'
                    stroke-width='1.25'
                    stroke-linecap='round'
                    stroke-linejoin='round'
                />
            </g>
            <defs>
                <clipPath id='clip0_185_99682'>
                    <rect width='16' height='16' fill='white' transform='translate(1.66406 1.66699)' />
                </clipPath>
            </defs>
        </svg>
    );
};

export default Freehand;
