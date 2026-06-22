import { createRoot } from 'react-dom/client';

import App, { type AppProps } from './App';

const FLOATER_CONTAINER_CLASS = 'genai-sdk-floater-container genai-sdk-container';
const DIALOG_CONTAINER_CLASS = 'genai-sdk-container';

/** Lookup or create a body-level container with the given className. */
function getOrCreateContainer(className: string): HTMLElement {
    const firstClass = className.split(' ')[0];
    let container = document.querySelector(`.${firstClass}`) as HTMLElement | null;
    if (!container) {
        container = document.createElement('div');
        container.className = className;
        document.body.appendChild(container);
    }
    return container;
}

/** Signal to the host that the floater button may be shown again. */
function resetSDKFloaterState(): void {
    if (typeof window !== 'undefined' && (window as any).GenAISDK) {
        (window as any).GenAISDK.forceOpen = true;
    }
}

/** Build a mount fn that creates the named container, renders the App, and returns cleanup. */
function createMountFunction(view: 'floater' | 'dialog', containerClass: string) {
    return async (props: AppProps): Promise<() => void> => {
        const container = getOrCreateContainer(containerClass);
        const root = createRoot(container);

        const cleanup = () => {
            root.unmount();
            if (container.parentNode) {
                container.parentNode.removeChild(container);
                resetSDKFloaterState();
            }
        };

        root.render(<App {...props} view={view} onClose={cleanup} />);
        return cleanup;
    };
}

/**
 * Mount the GenAI App into a caller-supplied container.
 * Use for page/web-sdk views where the host owns the container element.
 */
export async function mount(container: HTMLElement, props: AppProps): Promise<() => void> {
    const root = createRoot(container);
    root.render(<App {...props} />);
    return () => root.unmount();
}

/** Mount as a floater dialog — SDK creates the container at the body level. */
export const mountWithFloater = createMountFunction('floater', FLOATER_CONTAINER_CLASS);

/** Mount as a full-screen dialog — SDK creates the container at the body level. */
export const mountWithDialog = createMountFunction('dialog', DIALOG_CONTAINER_CLASS);
