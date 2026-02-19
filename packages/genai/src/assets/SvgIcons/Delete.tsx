import type { SVGProps } from 'react';

const Delete = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
            <g clipPath='url(#clip0_10459_109698)'>
                <path
                    d='M12.9141 3.33333L12.0807 2.5H7.91406L7.08073 3.33333H4.16406V5H15.8307V3.33333H12.9141ZM4.9974 15.8333C4.9974 16.75 5.7474 17.5 6.66406 17.5H13.3307C14.2474 17.5 14.9974 16.75 14.9974 15.8333V5.83333H4.9974V15.8333ZM6.66406 7.5H13.3307V15.8333H6.66406V7.5Z'
                    fill='currentColor'
                />
            </g>
            <defs>
                <clipPath id='clip0_10459_109698'>
                    <rect width='20' height='20' fill='white' />
                </clipPath>
            </defs>
        </svg>
    );
};

export default Delete;
