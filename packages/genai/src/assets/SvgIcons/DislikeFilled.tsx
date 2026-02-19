import type { SVGProps } from 'react';

const DislikeFilled = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none' {...props}>
            <g clipPath='url(#clip0_10305_85893)'>
                <path
                    opacity='0.3'
                    d='M17.5 9.99948V8.33281H10L11.1167 3.88281L7.5 7.49948V15.8328H15L17.5 9.99948Z'
                    fill='currentColor'
                />
                <path
                    d='M7.5026 17.4987H15.0026C15.6943 17.4987 16.2859 17.082 16.5359 16.482L19.0526 10.607C19.1276 10.4154 19.1693 10.2154 19.1693 9.9987V8.33203C19.1693 7.41536 18.4193 6.66536 17.5026 6.66536H12.2443L13.0359 2.85703L13.0609 2.59036C13.0609 2.2487 12.9193 1.93203 12.6943 1.70703L11.8109 0.832031L6.31927 6.3237C6.01927 6.6237 5.83594 7.04036 5.83594 7.4987V15.832C5.83594 16.7487 6.58594 17.4987 7.5026 17.4987ZM7.5026 7.4987L11.1193 3.88203L10.0026 8.33203H17.5026V9.9987L15.0026 15.832H7.5026V7.4987ZM0.835938 7.4987H4.16927V17.4987H0.835938V7.4987Z'
                    fill='currentColor'
                />
            </g>
            <defs>
                <clipPath id='clip0_10305_85893'>
                    <rect width='20' height='20' fill='white' />
                </clipPath>
            </defs>
        </svg>
    );
};

export default DislikeFilled;
