import { Check } from 'lucide-react';

import type { OctoPhase } from '@/modules/auto-prompt/phase';
import { cn } from '@/utils/cn';

interface PromptStatusProps {
    /** Lifecycle phase from the auto-prompt cycle. */
    phase: OctoPhase;
    /** Optional resume action for the paused state. Omit to hide the Resume link. */
    onResume?: () => void;
}

const LINE = 'gai:flex gai:items-center gai:gap-1.5 gai:px-4 gai:py-1.5 gai:text-xs gai:font-medium';

/**
 * Status line above the composer for the non-countdown phases — Generating… (thinking),
 * Prompted (response), Paused (post-close). The countdown ("Prompting in… N") is shown by the
 * composer itself, so it is intentionally absent here.
 */
export function PromptStatus({ phase, onResume }: PromptStatusProps) {
    if (phase === 'thinking') {
        return (
            <div className={LINE} role='status' aria-live='polite'>
                <span className='gai:animate-shimmer gai:bg-gradient-to-r gai:from-primary-400 gai:via-primary-200 gai:to-primary-400 gai:bg-[length:200%_100%] gai:bg-clip-text gai:font-semibold gai:text-transparent'>
                    Generating...
                </span>
            </div>
        );
    }

    if (phase === 'response') {
        return (
            <div className={cn(LINE, 'gai:text-[#16a34a]')} role='status' aria-live='polite'>
                <Check className='gai:h-3.5 gai:w-3.5' />
                <span>Prompted</span>
            </div>
        );
    }

    if (phase === 'collapsed') {
        return (
            <div className={cn(LINE, 'gai:text-secondary-gray-500')} role='status'>
                <span>Paused prompting.</span>
                {onResume && (
                    <button
                        type='button'
                        onClick={onResume}
                        className='gai:cursor-pointer gai:font-semibold gai:text-primary-500 hover:gai:underline'
                    >
                        Resume
                    </button>
                )}
            </div>
        );
    }

    return null;
}
