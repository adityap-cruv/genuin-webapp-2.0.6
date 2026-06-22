import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';

import {
    attachDraggableHandlers,
    persistFloaterPosition,
    snapToEdge,
    type DraggieLike,
} from './floaterDraggable';

describe('snapToEdge', () => {
    it('snaps to x=20 when closer to the left edge', () => {
        expect(snapToEdge(10, 1000)).toBe(20);
        expect(snapToEdge(100, 1000)).toBe(20);
    });

    it('snaps to viewportWidth-80 when closer to the right edge', () => {
        expect(snapToEdge(900, 1000)).toBe(920);
        expect(snapToEdge(700, 1000)).toBe(920);
    });

    it('snaps left at the midpoint (tie goes left)', () => {
        expect(snapToEdge(500, 1000)).toBe(20);
    });
});

describe('persistFloaterPosition', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('writes the position to localStorage as JSON', () => {
        persistFloaterPosition(20, 100);
        expect(localStorage.getItem('genai-floater-position')).toBe(JSON.stringify({ x: 20, y: 100 }));
    });

    it('swallows localStorage errors', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded');
        });
        expect(() => persistFloaterPosition(20, 100)).not.toThrow();
        setItemSpy.mockRestore();
    });
});

describe('attachDraggableHandlers', () => {
    let staticClick: () => void;
    let dragEnd: () => void;
    let draggie: DraggieLike;
    let floaterEl: HTMLElement;

    beforeEach(() => {
        staticClick = () => {};
        dragEnd = () => {};
        draggie = {
            position: { x: 100, y: 200 },
            on: vi.fn((event, handler) => {
                if (event === 'staticClick') staticClick = handler;
                if (event === 'dragEnd') dragEnd = handler;
            }),
            setPosition: vi.fn(),
        };
        floaterEl = document.createElement('div');
        document.documentElement.style.width = '1000px';
        Object.defineProperty(document.documentElement, 'clientWidth', {
            configurable: true,
            value: 1000,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('staticClick emits EVENTS.OPEN_DIALOG and replaces floater innerHTML', async () => {
        attachDraggableHandlers(draggie, floaterEl);
        const opened = eventBus.waitFor(EVENTS.OPEN_DIALOG, 100);
        staticClick();
        // CustomEvent.detail is null when emitter passes undefined — bus quirk
        await expect(opened).resolves.toBeNull();
        expect(floaterEl.innerHTML).not.toBe('');
    });

    it('dragEnd snaps left when x < midpoint and persists position', () => {
        draggie.position = { x: 100, y: 200 };
        attachDraggableHandlers(draggie, floaterEl);
        dragEnd();
        expect(draggie.setPosition).toHaveBeenCalledWith(20, 200);
        expect(localStorage.getItem('genai-floater-position')).toBe(JSON.stringify({ x: 20, y: 200 }));
    });

    it('dragEnd snaps right when x > midpoint', () => {
        draggie.position = { x: 900, y: 50 };
        attachDraggableHandlers(draggie, floaterEl);
        dragEnd();
        expect(draggie.setPosition).toHaveBeenCalledWith(920, 50);
    });
});
