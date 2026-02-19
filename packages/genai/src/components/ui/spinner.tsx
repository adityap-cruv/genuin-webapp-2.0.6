const Spinner = ({
    size = 'md',
    color = 'primary',
}: {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary';
}) => {
    const sizes = {
        sm: 'gai:h-4 gai:w-4',
        md: 'gai:h-7 gai:w-7',
        lg: 'gai:h-10 gai:w-10',
    };
    const colors = {
        primary: 'gai:border-primary-500',
        secondary: 'gai:border-utility-white',
    };
    return (
        <div
            className={`gai:animate-spin gai:rounded-full gai:border-3 gai:border-t-transparent ${sizes[size]} gai:shrink-0 ${colors[color]}`}
        ></div>
    );
};

export default Spinner;
