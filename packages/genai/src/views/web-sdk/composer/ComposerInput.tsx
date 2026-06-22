import { useLayoutEffect } from 'react';
import type React from 'react';

import { cn } from '@/utils/cn';

import { DENSITY, type Density } from '../density';

const DEFAULT_MAX_LINES = 8;

interface ComposerInputProps {
    value: string;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    density: Density;
    placeholder?: string;
    readOnly?: boolean;
    /**
     * Allow the textarea to grow to multiple lines. Off (single-line) in the compact pill, where
     * the host sheet height is fixed and a growing input would overflow/clip.
     */
    multiline?: boolean;
    /** Caps the auto-grow height; past this the textarea inner-scrolls. */
    maxLines?: number;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onFocus: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
}

/**
 * The editable composer surface. In `multiline` mode it auto-grows from one line up to
 * `maxLines`, then inner-scrolls; otherwise it stays a single horizontally-clipped line (compact
 * pill). Keyboard handling (Enter to submit, arrow-key isolation) stays with the parent so it can
 * coordinate with the session/auto-prompt machinery and the host player swiper.
 */
export function ComposerInput({
    value,
    inputRef,
    density,
    placeholder = 'Ask anything',
    readOnly = false,
    multiline = true,
    maxLines = DEFAULT_MAX_LINES,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
}: ComposerInputProps) {
    const maxHeight = maxLines * DENSITY[density].lineHeightPx;

    // Auto-grow: reset to content height, cap at maxHeight, toggle inner scroll past the cap.
    // Single-line mode leaves the height to CSS so the compact pill never overflows.
    useLayoutEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        if (!multiline) {
            el.style.height = '';
            el.style.overflowY = 'hidden';
            return;
        }
        el.style.height = 'auto';
        const next = Math.min(el.scrollHeight, maxHeight);
        el.style.height = `${next}px`;
        el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [value, maxHeight, multiline, inputRef]);

    return (
        <textarea
            ref={inputRef}
            rows={1}
            value={value}
            placeholder={placeholder}
            readOnly={readOnly}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            style={multiline ? { maxHeight } : undefined}
            className={cn(
                'gai:min-w-0 gai:flex-1 gai:resize-none gai:border-0 gai:bg-transparent gai:py-1.5 gai:pl-2 gai:text-left gai:font-medium gai:text-secondary-gray-900 gai:outline-0',
                multiline
                    ? 'gai:whitespace-pre-wrap gai:break-words'
                    : 'gai:overflow-hidden gai:whitespace-nowrap gai:text-ellipsis',
                'gai:placeholder:overflow-hidden gai:placeholder:text-ellipsis gai:placeholder:whitespace-nowrap gai:placeholder:text-secondary-gray-600',
                DENSITY[density].inputText
            )}
        />
    );
}
