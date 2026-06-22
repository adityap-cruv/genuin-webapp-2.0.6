import { useRef } from 'react';
import type React from 'react';

import ArrowUpward from '@/assets/SvgIcons/ArrowUpward';
import Stop from '@/assets/SvgIcons/Stop';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

import { DENSITY, type Density } from '../density';

export type ComposerAction = 'send' | 'stop' | 'countdown';

interface ComposerActionButtonProps {
    /** Which glyph the button shows when it isn't loading. */
    action: ComposerAction;
    /** Seconds remaining — rendered for `action: 'countdown'`. */
    seconds?: number | null;
    /** Session is being created — overrides the glyph with a spinner. */
    loading?: boolean;
    disabled?: boolean;
    onClick: () => void;
    onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    density: Density;
    /** Optional override for the countdown number text size (full-prompt uses a fixed size). */
    countdownTextClassName?: string;
}

const RING_STROKE = 2.5;
/** Extra px around the button so the ring is a visible halo, not painted over by the fill. */
const RING_HALO = 6;

/** Circular progress border around the countdown button — depletes as the timer runs down. */
function CountdownRing({ fraction, sizePx }: { fraction: number; sizePx: number }) {
    const radius = sizePx / 2 - RING_STROKE / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - Math.max(0, Math.min(1, fraction)));
    return (
        <svg
            width={sizePx}
            height={sizePx}
            viewBox={`0 0 ${sizePx} ${sizePx}`}
            className='gai:pointer-events-none gai:absolute gai:inset-0 gai:-rotate-90'
        >
            {/* Track — the depleted portion, same hue faded so depletion still reads. */}
            <circle
                cx={sizePx / 2}
                cy={sizePx / 2}
                r={radius}
                fill='none'
                stroke='var(--color-primary-300)'
                strokeOpacity={0.25}
                strokeWidth={RING_STROKE}
            />
            {/* Progress — the remaining time, Blue-300 (#83A2FF). */}
            <circle
                cx={sizePx / 2}
                cy={sizePx / 2}
                r={radius}
                fill='none'
                stroke='var(--color-primary-300)'
                strokeWidth={RING_STROKE}
                strokeLinecap='round'
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
        </svg>
    );
}

/**
 * The composer's single action button. Morphs between send (↑), stop (■), and a countdown
 * number, with a spinner while a session is being created. In countdown mode a progress ring
 * frames the button, depleting as the seconds run down.
 */
export function ComposerActionButton({
    action,
    seconds,
    loading = false,
    disabled = false,
    onClick,
    onMouseDown,
    density,
    countdownTextClassName,
}: ComposerActionButtonProps) {
    // Track the countdown's starting value so the ring can show remaining/total. Resets between
    // counting episodes (seconds returns to null/0).
    const maxSecondsRef = useRef(0);
    if (seconds != null && seconds > maxSecondsRef.current) maxSecondsRef.current = seconds;
    if (seconds == null || seconds <= 0) maxSecondsRef.current = 0;
    const fraction = maxSecondsRef.current > 0 && seconds != null ? seconds / maxSecondsRef.current : 0;

    const glyph = loading ? (
        <Spinner size='sm' color='secondary' />
    ) : action === 'countdown' ? (
        <span className={cn('gai:font-semibold gai:text-white', countdownTextClassName ?? DENSITY[density].inputText)}>
            {seconds}
        </span>
    ) : action === 'stop' ? (
        <Stop />
    ) : (
        <ArrowUpward />
    );

    const button = (
        <Button
            size='icon'
            disabled={disabled}
            onClick={onClick}
            onMouseDown={onMouseDown}
            // Counter button — explicit Blue-500 + frosted backdrop, per the design tokens.
            style={
                action === 'countdown'
                    ? { backgroundColor: 'var(--color-primary-500)', backdropFilter: 'blur(9px)' }
                    : undefined
            }
            className={cn('gai:flex-shrink-0 gai:cursor-pointer gai:rounded-full', DENSITY[density].button)}
        >
            {glyph}
        </Button>
    );

    // Ring only while actively counting (not during the create-session spinner).
    if (action !== 'countdown' || loading) return button;

    // The ring is a halo *around* the button — its box is larger than the button so the arc
    // sits outside the filled circle instead of being painted over by it.
    const ringPx = DENSITY[density].buttonPx + RING_HALO;
    return (
        <div
            className='gai:relative gai:flex gai:flex-shrink-0 gai:items-center gai:justify-center'
            style={{ width: ringPx, height: ringPx }}
        >
            <CountdownRing fraction={fraction} sizePx={ringPx} />
            {button}
        </div>
    );
}
