import type { SVGProps } from 'react';

const Freehand = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
            <path
                d='M15.2083 5.5893C14.2915 4.56779 13.0853 3.84785 11.7491 3.52473C10.413 3.20161 9.00994 3.29055 7.72563 3.77977C6.4413 4.26898 5.33621 5.13543 4.55655 6.26447C3.7769 7.39351 3.35943 8.73193 3.35938 10.1027V10.6691'
                stroke='currentColor'
                strokeWidth='1.25'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M5.05469 14.6176C5.97143 15.6397 7.17762 16.3599 8.51368 16.6832C9.84973 17.0066 11.2527 16.9176 12.537 16.4283C13.8214 15.9389 14.9264 15.0721 15.7062 13.9426C16.4859 12.8131 16.9034 11.4741 16.9036 10.1027V9.53906'
                stroke='currentColor'
                strokeWidth='1.25'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M15.2109 11.2318L16.9036 9.53906L18.5964 11.2318'
                stroke='currentColor'
                strokeWidth='1.12847'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M5.04948 9.53906L3.35677 11.2318L1.66406 9.53906'
                stroke='currentColor'
                strokeWidth='1.12847'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default Freehand;
