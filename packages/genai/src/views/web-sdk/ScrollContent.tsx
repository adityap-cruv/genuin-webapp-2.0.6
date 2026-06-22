import type { RefObject } from 'react';

import Chat from '@/components/Chat';
import { CompactSkeleton } from '@/components/ui/compact-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';

import { DENSITY, type Density } from './density';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CountdownBadge({ value, uiDensity }: { value: number; uiDensity: Density }) {
    const d = DENSITY[uiDensity];
    return (
        <div className='gai:flex gai:items-center gai:gap-1.5 gai:px-1'>
            <div
                className={cn(
                    'gai:flex gai:items-center gai:justify-center gai:rounded-full gai:bg-primary-500',
                    d.countdownCircle
                )}
            >
                <span className={cn('gai:leading-none gai:font-bold gai:text-white', d.countdownText)}>{value}</span>
            </div>
            <span className={cn('gai:text-secondary-gray-500', d.countdownText)}>Prompting in...</span>
        </div>
    );
}

function CompactLoadingSkeleton({ uiDensity }: { uiDensity: Density }) {
    const d = DENSITY[uiDensity];
    return (
        <div className='gai:flex gai:w-full gai:justify-end'>
            <div className={cn('gai:flex gai:flex-col gai:items-end gai:gap-2', d.skeletonWrap)}>
                <div
                    className={cn(
                        'gai:flex gai:w-full gai:flex-col gai:gap-2 gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50',
                        d.skeletonBubble,
                        d.skeletonPadding
                    )}
                >
                    <CompactSkeleton width='55%' />
                </div>
            </div>
        </div>
    );
}

function FullLoadingSkeleton({ uiDensity }: { uiDensity: Density }) {
    const d = DENSITY[uiDensity];
    return (
        <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
            <div className='gai:flex gai:w-full gai:justify-end'>
                <div className={cn('gai:flex gai:flex-col gai:items-end gai:gap-2', d.skeletonWrap)}>
                    <div
                        className={cn(
                            'gai:flex gai:w-full gai:flex-col gai:gap-2 gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50',
                            d.skeletonBubble,
                            d.skeletonPadding
                        )}
                    >
                        <Skeleton className='gai:h-4 gai:w-full gai:max-w-[16rem] gai:bg-primary-200' />
                        <Skeleton className='gai:h-4 gai:w-3/4 gai:bg-primary-200' />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DummyMessageProps {
    prompt: string;
    countdown: number | null;
    panelViewCountdown: number | null;
    onClick: () => void;
    uiDensity: Density;
}

function DummyMessage({ prompt, countdown, panelViewCountdown, onClick, uiDensity }: DummyMessageProps) {
    const d = DENSITY[uiDensity];
    const activeCountdown = panelViewCountdown !== null && panelViewCountdown > 0 ? panelViewCountdown : countdown;
    const showCountdown = activeCountdown !== null && activeCountdown > 0;

    return (
        <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
            <div className='gai:flex gai:w-full gai:justify-end'>
                <div className={cn('gai:flex gai:flex-col gai:items-end gai:gap-2', d.skeletonWrap)}>
                    <div
                        className={cn(
                            'hover:gai:bg-primary-100 gai:cursor-pointer gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:font-body-1-med gai:text-secondary-gray-900 gai:transition-colors',
                            d.skeletonBubble,
                            d.bubblePadding,
                            d.bubbleText
                        )}
                        onClick={onClick}
                    >
                        {prompt}
                    </div>
                    {showCountdown && uiDensity !== 'xs' && (
                        <CountdownBadge value={activeCountdown!} uiDensity={uiDensity} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Scroll content
// ---------------------------------------------------------------------------

interface ScrollContentProps {
    /** An active chat session exists → render the chat. */
    hasSession: boolean;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
    shouldShowLoader: boolean;
    isCompactMode: boolean;
    showDummyMessage: boolean;
    primaryPrompt: string | undefined;
    countdown: number | null;
    panelViewCountdown: number | null;
    onDummyClick: () => void;
    uiDensity: Density;
}

/**
 * The web-sdk scroll area: resolves what fills it — the chat, a loading skeleton, the
 * auto-prompt dummy message, or empty — and renders the matching visual.
 */
export function ScrollContent({
    hasSession,
    scrollContainerRef,
    shouldShowLoader,
    isCompactMode,
    showDummyMessage,
    primaryPrompt,
    countdown,
    panelViewCountdown,
    onDummyClick,
    uiDensity,
}: ScrollContentProps) {
    if (hasSession) return <Chat scrollContainerRef={scrollContainerRef} />;

    if (shouldShowLoader) {
        return isCompactMode ? (
            <CompactLoadingSkeleton uiDensity={uiDensity} />
        ) : (
            <FullLoadingSkeleton uiDensity={uiDensity} />
        );
    }

    if (!isCompactMode && showDummyMessage && primaryPrompt) {
        return (
            <DummyMessage
                prompt={primaryPrompt}
                countdown={countdown}
                panelViewCountdown={panelViewCountdown}
                onClick={onDummyClick}
                uiDensity={uiDensity}
            />
        );
    }

    if (!isCompactMode) return <div className='gai:flex gai:w-full gai:items-center gai:justify-center' />;
    return null;
}
