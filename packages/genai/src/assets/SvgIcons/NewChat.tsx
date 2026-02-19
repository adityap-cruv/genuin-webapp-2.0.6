import type { SVGProps } from 'react';

const NewChat = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22' fill='none' {...props}>
            <path
                d='M8.60462 3.01172H3.01196C2.12947 3.01172 1.41406 3.72713 1.41406 4.60962V18.9907C1.41406 19.8733 2.12947 20.5886 3.01196 20.5886H17.3931C18.2756 20.5886 18.991 19.8733 18.991 18.9907V13.3981'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M11.7994 14.1353L7.00781 14.9943L7.8064 10.1588L16.1586 1.88261C16.3071 1.73353 16.4838 1.61519 16.6784 1.53444C16.873 1.45369 17.0817 1.41211 17.2926 1.41211C17.5034 1.41211 17.7123 1.45369 17.9069 1.53444C18.1015 1.61519 18.2782 1.73353 18.4267 1.88261L20.1197 3.56867C20.2694 3.71654 20.3883 3.89245 20.4693 4.08629C20.5503 4.28012 20.5921 4.48802 20.5921 4.698C20.5921 4.90798 20.5503 5.11589 20.4693 5.30971C20.3883 5.50355 20.2694 5.67947 20.1197 5.82734L11.7994 14.1353Z'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
        </svg>
    );
};

export default NewChat;
