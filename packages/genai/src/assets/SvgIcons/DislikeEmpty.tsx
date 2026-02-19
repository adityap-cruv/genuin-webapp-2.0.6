import type { SVGProps } from 'react';

const DislikeEmpty = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
            <g clipPath='url(#clip0_10305_85914)'>
                <path
                    d='M12.5026 2.5H5.0026C4.31094 2.5 3.71927 2.91667 3.46927 3.51667L0.952604 9.39167C0.877604 9.58333 0.835938 9.78333 0.835938 10V11.6667C0.835938 12.5833 1.58594 13.3333 2.5026 13.3333H7.76094L6.96927 17.1417L6.94427 17.4083C6.94427 17.75 7.08594 18.0667 7.31094 18.2917L8.19427 19.1667L13.6859 13.675C13.9859 13.375 14.1693 12.9583 14.1693 12.5V4.16667C14.1693 3.25 13.4193 2.5 12.5026 2.5ZM12.5026 12.5L8.88594 16.1167L10.0026 11.6667H2.5026V10L5.0026 4.16667H12.5026V12.5ZM15.8359 2.5H19.1693V12.5H15.8359V2.5Z'
                    fill='#6C757D'
                />
            </g>
            <defs>
                <clipPath id='clip0_10305_85914'>
                    <rect width='20' height='20' fill='white' />
                </clipPath>
            </defs>
        </svg>
    );
};

export default DislikeEmpty;
