import type { Components } from 'react-markdown';


/** Text size for paragraph/list content by density. */
const PROSE_TEXT_SIZE: Record<'xs' | 'sm' | 'base', string> = {
    base: 'gai:font-body-1-med',
    sm: 'gai:text-xs gai:font-medium',
    xs: 'gai:text-[10px] gai:font-medium gai:leading-tight',
};

/**
 * Returns ReactMarkdown component overrides for the given `uiDensity`.
 * Headings, code blocks, and structural elements scale down in dense views.
 */
export function getMarkdownComponents(uiDensity: 'xs' | 'sm' | 'base' = 'base'): Components {
    const prose = PROSE_TEXT_SIZE[uiDensity];
    const isXs = uiDensity === 'xs';
    const isSm = uiDensity === 'sm';

    return {
        h1: ({ children }) => (
            <h1
                className={
                    isXs
                        ? 'gai:mb-2 gai:text-sm gai:font-bold gai:text-gray-900'
                        : isSm
                          ? 'gai:mb-3 gai:text-base gai:font-bold gai:text-gray-900'
                          : 'sm:gai:mb-6 gai:mb-4 gai:font-headline-2-bold gai:text-gray-900'
                }
            >
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2
                className={
                    isXs
                        ? 'gai:mb-1 gai:text-xs gai:font-bold gai:text-gray-900'
                        : isSm
                          ? 'gai:mb-2 gai:text-sm gai:font-bold gai:text-gray-900'
                          : 'sm:gai:mb-5 gai:mb-4 gai:font-headline-3-bold gai:text-gray-900'
                }
            >
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3
                className={
                    isXs
                        ? 'gai:mb-1 gai:text-[10px] gai:font-bold gai:text-gray-900'
                        : isSm
                          ? 'gai:mb-2 gai:text-xs gai:font-bold gai:text-gray-900'
                          : 'sm:gai:mb-4 gai:mb-3 gai:font-headline-4-semi gai:text-gray-900'
                }
            >
                {children}
            </h3>
        ),
        h4: ({ children }) => (
            <h4 className={isXs || isSm ? 'gai:mb-1 gai:text-[10px] gai:font-semibold gai:text-gray-800' : 'sm:gai:mb-3 gai:mb-2 gai:font-body-0-med gai:text-gray-800'}>
                {children}
            </h4>
        ),
        h5: ({ children }) => (
            <h5 className={isXs || isSm ? 'gai:mb-1 gai:text-[10px] gai:font-semibold gai:text-gray-800' : 'gai:mb-2 gai:font-body-1-semi gai:text-gray-800'}>
                {children}
            </h5>
        ),
        h6: ({ children }) => (
            <h6 className={isXs || isSm ? 'gai:mb-1 gai:text-[10px] gai:font-semibold gai:text-gray-700' : 'gai:mb-2 gai:font-body-2-bold gai:text-gray-700'}>
                {children}
            </h6>
        ),
        p: ({ children }) => <p className={`${prose} gai:text-gray-700`}>{children}</p>,
        blockquote: ({ children }) => (
            <blockquote
                className={`gai:border-l-4 gai:border-blue-500 gai:bg-blue-50 gai:pl-3 gai:italic ${prose} gai:text-gray-700 ${isXs ? 'gai:py-1' : 'gai:mb-4 gai:py-3 gai:pl-4'}`}
            >
                {children}
            </blockquote>
        ),
        code: ({ children, className }) => {
            const isInline = !className?.includes('language-');
            if (isInline) {
                return (
                    <code
                        className={`gai:rounded gai:bg-gray-100 gai:px-1 gai:font-mono gai:text-pink-600 ${isXs ? 'gai:text-[9px]' : isSm ? 'gai:text-[10px]' : 'gai:py-1 gai:px-2 gai:font-body-2-med'}`}
                    >
                        {children}
                    </code>
                );
            }
            return <code className={className}>{children}</code>;
        },
        pre: ({ children }) => (
            <pre className={`gai:overflow-x-auto gai:rounded-lg gai:bg-gray-900 gai:font-body-2-med ${isXs ? 'gai:mb-2 gai:p-2' : 'gai:mb-6 gai:p-4'}`}>
                <code className='gai:font-mono gai:text-gray-100'>{children}</code>
            </pre>
        ),
        a: ({ children, href }) => (
            <a
                href={href}
                className='gai:text-blue-600 gai:underline gai:decoration-blue-600/30 gai:underline-offset-2 gai:transition-colors gai:hover:decoration-blue-600'
                target='_blank'
                rel='noopener noreferrer'
            >
                {children}
            </a>
        ),
        strong: ({ children }) => (
            <strong className={isXs || isSm ? 'gai:font-semibold gai:text-gray-900' : 'gai:font-body-1-semi gai:text-gray-900'}>
                {children}
            </strong>
        ),
        em: ({ children }) => <em className='gai:text-gray-700 gai:italic'>{children}</em>,
        table: ({ children }) => (
            <div className={`gai:overflow-x-auto gai:rounded-lg gai:border gai:border-gray-200 ${isXs ? 'gai:mb-2' : 'gai:mb-6'}`}>
                <table className='gai:min-w-full gai:divide-y gai:divide-gray-200'>{children}</table>
            </div>
        ),
        thead: ({ children }) => <thead className='gai:bg-gray-50'>{children}</thead>,
        tbody: ({ children }) => <tbody className='gai:divide-y gai:divide-gray-200 gai:bg-white'>{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => (
            <th className={`gai:text-left gai:font-bold gai:tracking-wider gai:text-gray-500 gai:uppercase ${isXs ? 'gai:px-2 gai:py-1 gai:text-[9px]' : 'gai:px-6 gai:py-3 gai:font-body-2-bold'}`}>
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className={`gai:font-medium gai:whitespace-nowrap gai:text-gray-900 ${isXs ? 'gai:px-2 gai:py-1 gai:text-[9px]' : isSm ? 'gai:px-3 gai:py-2 gai:text-xs' : 'gai:px-6 gai:py-4 gai:font-body-1-med'}`}>
                {children}
            </td>
        ),
        ul: ({ children }) => (
            <ul className={`gai:list-disc gai:pl-4 ${isXs ? 'gai:mb-1 gai:space-y-0' : 'gai:mb-4 gai:space-y-1 gai:pl-6'}`}>
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className={`gai:list-decimal gai:pl-4 ${isXs ? 'gai:mb-1 gai:space-y-0' : 'gai:mb-4 gai:space-y-1 gai:pl-6'}`}>
                {children}
            </ol>
        ),
        li: ({ children }) => <li className={`${prose} gai:text-gray-700`}>{children}</li>,
        hr: () => <hr className={`gai:border-0 gai:border-t gai:border-gray-200 ${isXs ? 'gai:my-2' : 'gai:my-8'}`} />,
        img: ({ src, alt, ...props }) => (
            <img
                src={src}
                alt={alt}
                className={`gai:mx-auto gai:block gai:h-auto gai:max-w-full gai:rounded-lg gai:border gai:border-gray-200 gai:shadow-sm ${isXs ? 'gai:mb-2' : 'gai:mb-6'}`}
                onError={e => {
                    e.currentTarget.style.display = 'none';
                }}
                {...props}
            />
        ),
    };
}

/** Default markdown components (base density). Kept for backwards compatibility. */
const Markdown: Components = getMarkdownComponents('base');

export default Markdown;
