import type { SVGProps } from 'react';

const CollapseSidebar = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22' fill='none' {...props}>
            <path
                d='M10.2031 1.44727V20.553'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M1.44531 18.9608V3.03941C1.44531 2.1601 2.15815 1.44727 3.03746 1.44727H18.9589C19.8382 1.44727 20.551 2.1601 20.551 3.03941V18.9608C20.551 19.8402 19.8382 20.553 18.9589 20.553H3.03746C2.15815 20.553 1.44531 19.8402 1.44531 18.9608Z'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default CollapseSidebar;
