import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import { createFloaterSpinner } from '@/styles/floaterStyles';

/**
 * Minimal Draggabilly surface we depend on. The real class is loaded at
 * runtime from a CDN script, but tests use a typed fake.
 */
export interface DraggieLike {
    position: { x: number; y: number };
    on(event: 'staticClick' | 'dragEnd', handler: () => void): void;
    setPosition(x: number, y: number): void;
}

const FLOATER_POSITION_KEY = 'genai-floater-position';
const LEFT_SNAP_X = 20;
const RIGHT_SNAP_OFFSET = 80;

/**
 * Compute the snapped x-coordinate after a drag ends.
 * Floater snaps to the nearer screen edge.
 */
export function snapToEdge(currentX: number, viewportWidth: number): number {
    const distanceToLeft = currentX;
    const distanceToRight = viewportWidth - currentX;
    return distanceToLeft <= distanceToRight ? LEFT_SNAP_X : viewportWidth - RIGHT_SNAP_OFFSET;
}

/**
 * Persist floater position to localStorage. Best-effort — any error is swallowed
 * (e.g. quota-exceeded, disabled storage).
 */
export function persistFloaterPosition(x: number, y: number): void {
    try {
        localStorage.setItem(FLOATER_POSITION_KEY, JSON.stringify({ x, y }));
    } catch {
        // Ignore — non-critical, position will recompute on next drag
    }
}

const DRAGGABILLY_CDN_URL = 'https://unpkg.com/draggabilly@3/dist/draggabilly.pkgd.min.js';

/**
 * Lazy-load the Draggabilly script from CDN. Resolves when ready, rejects if
 * the script tag fails. No-op if already loaded.
 */
export function loadDraggabillyScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('No window available'));
            return;
        }
        if ((window as any).Draggabilly) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = DRAGGABILLY_CDN_URL;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load draggabilly'));
        document.head.appendChild(script);
    });
}

/**
 * Wire a Draggabilly instance into the SDK: staticClick opens the dialog,
 * dragEnd snaps to the nearer edge and persists position.
 */
export function attachDraggableHandlers(draggie: DraggieLike, floaterElement: HTMLElement): void {
    draggie.on('staticClick', () => {
        floaterElement.innerHTML = createFloaterSpinner();
        eventBus.emit(EVENTS.OPEN_DIALOG, undefined);
    });

    draggie.on('dragEnd', () => {
        const viewportWidth = document.documentElement.clientWidth;
        const { x, y } = draggie.position;
        const finalX = snapToEdge(x, viewportWidth);
        draggie.setPosition(finalX, y);
        persistFloaterPosition(finalX, y);
    });
}
