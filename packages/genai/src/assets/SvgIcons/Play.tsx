const Play = ({ className }: { className?: string }) => {
    return (
        <svg
            width='18'
            height='18'
            viewBox='0 0 18 18'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={className}
        >
            <path d='M4.5 2.25L15 9L4.5 15.75V2.25Z' fill='currentColor' />
        </svg>
    );
};

export default Play;
