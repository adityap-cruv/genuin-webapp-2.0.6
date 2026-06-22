/**
 * Density tokens for the web-sdk Octo composer.
 *
 * The SDK host picks a `uiDensity` at init; every sizing-sensitive element reads its slot
 * from a single `DENSITY[density]` lookup instead of scattered per-token maps.
 */

export type Density = 'xs' | 'sm' | 'base';

interface DensitySlots {
    /** Octo avatar circle dimensions. */
    avatar: string;
    /** Editable input container min-height. */
    inputMinHeight: string;
    /** Text size for input + prompt surfaces. */
    inputText: string;
    /** Send / stop / countdown action button dimensions. */
    button: string;
    /** Action button size in px — used to size the countdown progress ring overlay. */
    buttonPx: number;
    /** Approx line height (px) used to cap the auto-growing textarea. */
    lineHeightPx: number;

    // ── Scroll-content (dummy message + loading skeletons) ──────────────────
    /** Countdown badge circle dimensions. */
    countdownCircle: string;
    /** Countdown badge text size. */
    countdownText: string;
    /** Skeleton/bubble wrapper width. */
    skeletonWrap: string;
    /** Skeleton/bubble max width. */
    skeletonBubble: string;
    /** Skeleton bubble padding. */
    skeletonPadding: string;
    /** Dummy-message bubble padding. */
    bubblePadding: string;
    /** Dummy-message bubble text size. */
    bubbleText: string;
}

export const DENSITY: Record<Density, DensitySlots> = {
    base: {
        avatar: 'gai:h-11 gai:w-11',
        inputMinHeight: 'gai:min-h-[44px]',
        inputText: 'gai:text-base',
        button: 'gai:h-9 gai:w-9',
        buttonPx: 36,
        lineHeightPx: 24,
        countdownCircle: 'gai:h-4 gai:w-4',
        countdownText: 'gai:text-[10px]',
        skeletonWrap: 'gai:w-[80%]',
        skeletonBubble: 'gai:max-w-[70%]',
        skeletonPadding: 'gai:px-4 gai:py-3',
        bubblePadding: 'gai:px-4 gai:py-3',
        bubbleText: 'gai:text-sm',
    },
    sm: {
        avatar: 'gai:h-8 gai:w-8',
        inputMinHeight: 'gai:min-h-[36px]',
        inputText: 'gai:text-sm',
        button: 'gai:h-7 gai:w-7',
        buttonPx: 28,
        lineHeightPx: 20,
        countdownCircle: 'gai:h-3 gai:w-3',
        countdownText: 'gai:text-[8px]',
        skeletonWrap: 'gai:w-[80%]',
        skeletonBubble: 'gai:max-w-[70%]',
        skeletonPadding: 'gai:px-3 gai:py-2',
        bubblePadding: 'gai:px-3 gai:py-2',
        bubbleText: 'gai:text-xs',
    },
    xs: {
        avatar: 'gai:h-7 gai:w-7',
        inputMinHeight: 'gai:min-h-[28px]',
        inputText: 'gai:text-xs',
        button: 'gai:h-6 gai:w-6',
        buttonPx: 24,
        lineHeightPx: 16,
        countdownCircle: 'gai:h-3 gai:w-3',
        countdownText: 'gai:text-[8px]',
        skeletonWrap: 'gai:w-full',
        skeletonBubble: 'gai:max-w-full',
        skeletonPadding: 'gai:px-2 gai:py-1',
        bubblePadding: 'gai:px-2 gai:py-1',
        bubbleText: 'gai:text-[10px]',
    },
};
