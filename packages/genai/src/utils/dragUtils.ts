// Drag utility for floater elements

export interface DragState {
    isDragging: boolean;
    hasDragged: boolean;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
}

export interface DragHandlers {
    onMouseDown: (e: MouseEvent | React.MouseEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: () => void;
    cleanup: () => void;
}

export function createDragHandlers(element: HTMLElement, onDragStateChange?: (state: DragState) => void): DragHandlers {
    let dragState: DragState = {
        isDragging: false,
        hasDragged: false,
        offsetX: 0,
        offsetY: 0,
        startX: 0,
        startY: 0,
    };

    const onMouseDown = (e: MouseEvent | React.MouseEvent) => {
        dragState.isDragging = true;
        dragState.hasDragged = false;
        dragState.startX = e.clientX;
        dragState.startY = e.clientY;

        const rect = element.getBoundingClientRect();
        dragState.offsetX = e.clientX - rect.left;
        dragState.offsetY = e.clientY - rect.top;

        element.style.cursor = 'grabbing';
        element.style.transition = 'none';

        // Switch to left/top positioning from bottom/right
        element.style.bottom = 'auto';
        element.style.right = 'auto';
        element.style.left = `${rect.left}px`;
        element.style.top = `${rect.top}px`;

        e.preventDefault();
        onDragStateChange?.(dragState);
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!dragState.isDragging) return;

        // Check if mouse has moved enough to consider it a drag
        const deltaX = Math.abs(e.clientX - dragState.startX);
        const deltaY = Math.abs(e.clientY - dragState.startY);
        if (deltaX > 3 || deltaY > 3) {
            dragState.hasDragged = true;
        }

        const newX = e.clientX - dragState.offsetX;
        const newY = e.clientY - dragState.offsetY;

        // Constrain to viewport
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        element.style.left = `${constrainedX}px`;
        element.style.top = `${constrainedY}px`;

        onDragStateChange?.(dragState);
    };

    const onMouseUp = () => {
        if (dragState.isDragging) {
            dragState.isDragging = false;
            element.style.cursor = 'grab';

            // Store drag state on element for click handling
            (element as any).__dragData__ = { hasDragged: dragState.hasDragged };

            onDragStateChange?.(dragState);
        }
    };

    const cleanup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    return {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        cleanup,
    };
}

export function setupDragListeners(element: HTMLElement, onDragStateChange?: (state: DragState) => void): () => void {
    const handlers = createDragHandlers(element, onDragStateChange);

    element.addEventListener('mousedown', handlers.onMouseDown);
    document.addEventListener('mousemove', handlers.onMouseMove);
    document.addEventListener('mouseup', handlers.onMouseUp);

    // Set initial cursor
    element.style.cursor = 'grab';

    return () => {
        element.removeEventListener('mousedown', handlers.onMouseDown);
        handlers.cleanup();
    };
}

export function checkDragClick(element: HTMLElement): boolean {
    const floaterData = (element as any).__dragData__;
    if (floaterData && floaterData.hasDragged) {
        floaterData.hasDragged = false; // Reset for next interaction
        return true; // Was a drag, should prevent click
    }
    return false; // Was not a drag, allow click
}

export function hideFloater(element: HTMLElement) {
    element.style.display = 'none';
}

export function showFloater(element: HTMLElement) {
    element.style.display = 'block';
}
