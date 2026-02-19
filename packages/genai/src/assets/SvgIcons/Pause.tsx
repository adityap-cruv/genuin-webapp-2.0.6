import type { SVGProps } from 'react';

const Pause = (props: SVGProps<SVGSVGElement>) => (
    <svg width='16' height='16' viewBox='0 0 16 16' fill='none' {...props}>
        <rect x='4' y='3' width='3' height='10' fill='currentColor' />
        <rect x='9' y='3' width='3' height='10' fill='currentColor' />
    </svg>
);

export default Pause;

