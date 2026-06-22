import { cn } from '@/utils/cn';

import { DENSITY, type Density } from '../density';

interface PromptPreviewProps {
    prompt: string;
    density: Density;
    /**
     * `suggested` — labelled column ("Suggested" + prompt), used by the compact idea state.
     * `inline` — a single truncated line, used by the countdown-only state.
     */
    variant: 'suggested' | 'inline';
    /** Suggested variant only: show a shimmer placeholder while the prompt loads. */
    isLoading?: boolean;
    /** Suggested variant label. */
    label?: string;
    onClick?: () => void;
}

/** Read-only prompt surface for the suggested + countdown-only composer states. */
export function PromptPreview({
    prompt,
    density,
    variant,
    isLoading = false,
    label = 'Suggested',
    onClick,
}: PromptPreviewProps) {
    const textSize = DENSITY[density].inputText;

    if (variant === 'inline') {
        return (
            <span
                className={cn(
                    'gai:min-w-0 gai:flex-1 gai:truncate gai:text-left gai:font-medium gai:text-secondary-gray-900',
                    onClick && 'gai:cursor-pointer',
                    textSize
                )}
                onClick={onClick}
            >
                {prompt}
            </span>
        );
    }

    return (
        <div
            className={cn('gai:flex gai:min-w-0 gai:flex-1 gai:flex-col gai:overflow-hidden', onClick && 'gai:cursor-pointer')}
            onClick={onClick}
        >
            <span className='gai:text-[9px] gai:font-medium gai:tracking-wide gai:text-secondary-gray-700 gai:md:text-[10px]'>
                {label}
            </span>
            {isLoading ? (
                <span
                    className={cn(
                        'gai:animate-shimmer gai:bg-gradient-to-r gai:from-primary-400 gai:via-primary-200 gai:to-primary-400 gai:bg-[length:200%_100%] gai:bg-clip-text gai:font-semibold gai:text-transparent',
                        textSize
                    )}
                >
                    Loading...
                </span>
            ) : (
                <span className={cn('gai:line-clamp-1 gai:font-semibold gai:text-secondary-gray-900', textSize)}>
                    {prompt}
                </span>
            )}
        </div>
    );
}
