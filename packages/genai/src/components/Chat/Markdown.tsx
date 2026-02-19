import type { Components } from 'react-markdown';

const MarkdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className='sm:gai:mb-6 gai:mb-4 gai:font-headline-2-bold gai:text-gray-900'>{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className='sm:gai:mb-5 gai:mb-4 gai:font-headline-3-bold gai:text-gray-900'>{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className='sm:gai:mb-4 gai:mb-3 gai:font-headline-4-semi gai:text-gray-900'>{children}</h3>
    ),
    h4: ({ children }) => <h4 className='sm:gai:mb-3 gai:mb-2 gai:font-body-0-med gai:text-gray-800'>{children}</h4>,
    h5: ({ children }) => <h5 className='gai:mb-2 gai:font-body-1-semi gai:text-gray-800'>{children}</h5>,
    h6: ({ children }) => <h6 className='gai:mb-2 gai:font-body-2-bold gai:text-gray-700'>{children}</h6>,
    p: ({ children }) => <p className='gai:font-body-1-med gai:text-gray-700'>{children}</p>,
    blockquote: ({ children }) => (
        <blockquote className='gai:mb-4 gai:border-l-4 gai:border-blue-500 gai:bg-blue-50 gai:py-3 gai:pl-4 gai:font-body-1-med gai:text-gray-700 gai:italic'>
            {children}
        </blockquote>
    ),
    code: ({ children, className }) => {
        const isInline = !className?.includes('language-');
        if (isInline) {
            return (
                <code className='gai:rounded gai:bg-gray-100 gai:px-2 gai:py-1 gai:font-mono gai:font-body-2-med gai:text-pink-600'>
                    {children}
                </code>
            );
        }
        return <code className={className}>{children}</code>;
    },
    pre: ({ children }) => (
        <pre className='gai:mb-6 gai:overflow-x-auto gai:rounded-lg gai:bg-gray-900 gai:p-4 gai:font-body-2-med'>
            <code className='gai:font-mono gai:text-gray-100'>{children}</code>
        </pre>
    ),
    a: ({ children, href }) => (
        <a
            href={href}
            className='gai:hover:decoration-blue-600 gai:text-blue-600 gai:underline gai:decoration-blue-600/30 gai:underline-offset-2 gai:transition-colors'
            target='_blank'
            rel='noopener noreferrer'
        >
            {children}
        </a>
    ),
    strong: ({ children }) => <strong className='gai:font-body-1-semi gai:text-gray-900'>{children}</strong>,
    em: ({ children }) => <em className='gai:text-gray-700 gai:italic'>{children}</em>,
    table: ({ children }) => (
        <div className='gai:mb-6 gai:overflow-x-auto gai:rounded-lg gai:border gai:border-gray-200'>
            <table className='gai:min-w-full gai:divide-y gai:divide-gray-200'>{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className='gai:bg-gray-50'>{children}</thead>,
    tbody: ({ children }) => <tbody className='gai:divide-y gai:divide-gray-200 gai:bg-white'>{children}</tbody>,
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
        <th className='gai:px-6 gai:py-3 gai:text-left gai:font-body-2-bold gai:tracking-wider gai:text-gray-500 gai:uppercase'>
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className='gai:px-6 gai:py-4 gai:font-body-1-med gai:whitespace-nowrap gai:text-gray-900'>{children}</td>
    ),
    ul: ({ children }) => <ul className='gai:mb-4 gai:list-disc gai:space-y-1 gai:pl-6'>{children}</ul>,
    ol: ({ children }) => <ol className='gai:mb-4 gai:list-decimal gai:space-y-1 gai:pl-6'>{children}</ol>,
    li: ({ children }) => <li className='gai:font-body-1-med gai:text-gray-700'>{children}</li>,
    hr: () => <hr className='gai:my-8 gai:border-0 gai:border-t gai:border-gray-200' />,
    img: ({ src, alt, ...props }) => (
        <img
            src={src}
            alt={alt}
            className='gai:mx-auto gai:mb-6 gai:block gai:h-auto gai:max-w-full gai:rounded-lg gai:border gai:border-gray-200 gai:shadow-sm'
            onError={e => {
                e.currentTarget.style.display = 'none';
            }}
            {...props}
        />
    ),
};

export default MarkdownComponents;
