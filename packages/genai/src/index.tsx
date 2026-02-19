import './index.css';
import { createFloaterElement, showFloaterSpinner, createFloaterSpinner } from './styles/floaterStyles';
import type { PendingMessage } from './types';

interface SDKConfig {
    containerId?: string;
    containerElement?: HTMLElement;
    userId: string;
    brandId: number;
    sessionId?: string;
    view?: 'page' | 'floater' | 'dialog' | 'web-sdk';
    draggable?: boolean;
    userEmail?: string;
    userUUID?: string;
    isMaya?: boolean;
    parentWebSdkInstanceId?: string;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId?: string;
    videoId?: string;
}

let appInstance: any = null;
let floater: HTMLElement | null = null;
let currentConfig: SDKConfig | null = null;
let persistentEventListener: ((event: Event) => void) | null = null;
let messageEventListener: ((event: Event) => void) | null = null;
let pendingMessages: Array<PendingMessage> = [];

function createFloater() {
    // Remove existing floater if any
    if (floater) {
        floater.remove();
        floater = null;
    }
    floater = createFloaterElement(currentConfig?.draggable);
    return floater;
}

// Show initial loading state without React
const showLoadingState = (container: HTMLElement) => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.alignItems = 'center';
    div.style.height = '100%';
    div.style.width = '100%';
    div.innerHTML = '<div></div>';
    container.innerHTML = '';
    container.appendChild(div);
};

function isSDKMounted(): boolean {
    return document.querySelector('.genai-sdk-container') !== null;
}

// Create and show loading overlay for dialog
function createLoadingOverlay(): HTMLElement {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'genai-loading-overlay';
    loadingOverlay.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(2px);
        ">
            <div style="
                width: 40px;
                height: 40px;
                border: 3px solid #ffffff;
                border-top: 3px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loadingOverlay);
    return loadingOverlay;
}

// Remove loading overlay
function removeLoadingOverlay(overlay?: HTMLElement | null) {
    const targetOverlay = overlay || document.getElementById('genai-loading-overlay');
    if (targetOverlay && targetOverlay.parentNode) {
        targetOverlay.parentNode.removeChild(targetOverlay);
    }
}

// Load and mount floater app
async function loadFloaterApp(config: SDKConfig): Promise<void> {
    const { mountWithFloater } = await import('./App');

    appInstance = {
        unmount: await mountWithFloater({
            userId: config.userId,
            brandId: config.brandId,
            sessionId: config.sessionId,
            pendingMessages: [...pendingMessages],
            userEmail: config.userEmail,
            userUUID: config.userUUID,
            isMaya: config.isMaya,
            parentWebSdkInstanceId: config.parentWebSdkInstanceId,
            parentWebSdkContainerId: config.parentWebSdkContainerId,
            parentWebSdkEmbedId: config.parentWebSdkEmbedId,
            parentWebSdkPlacementId: config.parentWebSdkPlacementId,
            parentOctoPanelId: config.parentOctoPanelId,
            videoId: config.videoId,
        }),
    };

    // Clear pending messages after passing them to the app
    pendingMessages = [];
}

// Load and mount dialog app
async function loadDialogApp(config: SDKConfig): Promise<void> {
    const { mountWithDialog } = await import('./App');

    appInstance = {
        unmount: await mountWithDialog({
            userId: config.userId,
            brandId: config.brandId,
            sessionId: config.sessionId,
            pendingMessages: [...pendingMessages],
            userEmail: config.userEmail,
            userUUID: config.userUUID,
            isMaya: config.isMaya,
            parentWebSdkInstanceId: config.parentWebSdkInstanceId,
            parentWebSdkContainerId: config.parentWebSdkContainerId,
            parentWebSdkEmbedId: config.parentWebSdkEmbedId,
            parentWebSdkPlacementId: config.parentWebSdkPlacementId,
            parentOctoPanelId: config.parentOctoPanelId,
            videoId: config.videoId,
        }),
    };

    // Clear pending messages after passing them to the app
    pendingMessages = [];
}

function setupPersistentEventListener() {
    if (persistentEventListener) {
        return;
    }

    persistentEventListener = async (event: Event) => {
        // Extract isMaya from event detail if provided (for mode switching)
        const customEvent = event as CustomEvent<{ isMaya?: boolean }>;
        const isMayaFromEvent = customEvent?.detail?.isMaya;

        // Check if isMaya mode is changing (normalize undefined to false for comparison)
        const currentIsMaya = currentConfig?.isMaya ?? false;
        const requestedIsMaya = isMayaFromEvent ?? false;

        if (currentConfig && isMayaFromEvent !== undefined && currentIsMaya !== requestedIsMaya) {
            // Mode switch requested - update config and load app with new isMaya value
            currentConfig = { ...currentConfig, isMaya: isMayaFromEvent };

            // Unmount existing app if mounted
            if (appInstance?.unmount) {
                appInstance.unmount();
                appInstance = null;
            }

            // Load the app with new config
            if (currentConfig.view === 'floater') {
                showFloaterSpinner();
                await loadFloaterApp(currentConfig);
            } else if (currentConfig.view === 'dialog') {
                const loadingOverlay = createLoadingOverlay();
                try {
                    await loadDialogApp(currentConfig);
                    removeLoadingOverlay(loadingOverlay);
                } catch (error) {
                    console.error('Failed to load GenAI content in dialog:', error);
                    removeLoadingOverlay(loadingOverlay);
                }
            }
            return;
        }

        if (isSDKMounted() && !window.GenAISDK.forceOpen) return;

        window.GenAISDK.forceOpen = false;
        // Component is not mounted, reinitialize
        if (currentConfig) {
            if (currentConfig.view === 'floater') {
                // Show loading spinner on the floater if it exists
                showFloaterSpinner();

                await loadFloaterApp(currentConfig);
            } else if (currentConfig.view === 'dialog') {
                const loadingOverlay = createLoadingOverlay();

                try {
                    await loadDialogApp(currentConfig);
                    removeLoadingOverlay(loadingOverlay);
                } catch (error) {
                    console.error('Failed to load GenAI content in dialog:', error);
                    removeLoadingOverlay(loadingOverlay);
                }
            } else {
                init(currentConfig);
            }
        } else {
            console.warn('No stored config available for reinitialization');
        }
    };

    window.addEventListener('genai:openDialog', persistentEventListener);

    // Setup genai:message event listener
    if (!messageEventListener) {
        messageEventListener = ((event: CustomEvent) => {
            const { message, agent_id, session_id } = event.detail || {};

            if (!message) {
                console.warn('genai:message event requires a message');
                return;
            }

            // Check if app is mounted
            if (!isSDKMounted()) {
                // Store the message to send after app loads
                pendingMessages.push({ message, agent_id, session_id });
                // Trigger dialog open to load the app (only if this is the first pending message)
                if (pendingMessages.length === 1) {
                    window.dispatchEvent(new Event('genai:openDialog'));
                }
            } else {
                // App is already mounted, dispatch the message
                window.dispatchEvent(
                    new CustomEvent('genai:sendMessage', {
                        detail: {
                            message,
                            agent_id,
                            session_id,
                        },
                    })
                );
            }
        }) as EventListener;

        window.addEventListener('genai:message', messageEventListener);
    }
}

function removePersistentEventListener() {
    if (persistentEventListener) {
        window.removeEventListener('genai:openDialog', persistentEventListener);
        persistentEventListener = null;
    }
    if (messageEventListener) {
        window.removeEventListener('genai:message', messageEventListener);
        messageEventListener = null;
    }
}

function initializeDraggability(floaterElement: HTMLElement) {
    try {
        const draggie = new (window as any).Draggabilly(floaterElement, {
            containment: 'body',
        });

        draggie.on('staticClick', () => {
            floaterElement.innerHTML = createFloaterSpinner();
            window.dispatchEvent(new Event('genai:openDialog'));
        });

        draggie.on('dragEnd', () => {
            const viewportWidth = document.documentElement.clientWidth;
            const { x, y } = draggie.position;
            const distanceToLeft = x;
            const distanceToRight = viewportWidth - x;
            const nearestDistance = Math.min(distanceToLeft, distanceToRight);

            let finalX: number;
            if (nearestDistance === distanceToLeft) {
                finalX = 20;
                draggie.setPosition(20, y);
            } else {
                finalX = viewportWidth - 80;
                draggie.setPosition(viewportWidth - 80, y);
            }

            // Save position to localStorage
            try {
                localStorage.setItem('genai-floater-position', JSON.stringify({ x: finalX, y }));
            } catch {
                // Ignore localStorage errors
            }
        });
    } catch (err) {
        console.error('Error initializing Draggabilly:', err);
    }
}

export async function init(initConfig: SDKConfig) {
    currentConfig = { ...initConfig };
    window.GenAISDK.forceOpen = true;
    if (appInstance?.unmount) {
        appInstance.unmount();
        appInstance = null;
    }

    if (!initConfig.brandId || !initConfig.userId) {
        console.error('Brand ID is required');
        return;
    }
    if (initConfig.brandId < -1) {
        console.error('Brand ID is required');
        return;
    }

    const viewMode = initConfig.view || 'dialog'; // Default to dialog mode

    setupPersistentEventListener();

    try {
        if (viewMode === 'page' || viewMode === 'web-sdk') {
            if (!initConfig.containerId && !initConfig.containerElement) {
                console.error(`Container ID or container element is required for ${viewMode} view`);
                return;
            }

            const container = initConfig.containerElement || document.getElementById(initConfig.containerId!);
            if (!container) {
                console.error(`Container with ID '${initConfig.containerId}' not found`);
                return;
            }

            showLoadingState(container);

            const { mount } = await import('./App');

            appInstance = {
                unmount: await mount(container, {
                    userId: initConfig.userId,
                    brandId: initConfig.brandId,
                    sessionId: viewMode === 'web-sdk' ? undefined : initConfig.sessionId, // web-sdk is always ephemeral
                    userEmail: initConfig.userEmail,
                    userUUID: initConfig.userUUID,
                    isMaya: initConfig.isMaya,
                    view: viewMode,
                    parentWebSdkInstanceId: initConfig.parentWebSdkInstanceId,
                    parentWebSdkContainerId: initConfig.parentWebSdkContainerId,
                    parentWebSdkEmbedId: initConfig.parentWebSdkEmbedId,
                    parentWebSdkPlacementId: initConfig.parentWebSdkPlacementId,
                    parentOctoPanelId: initConfig.parentOctoPanelId,
                    videoId: initConfig.videoId,
                }),
            };
        } else if (viewMode === 'floater') {
            // Show floater immediately
            createFloater();

            // Load draggabilly if draggable is enabled
            if (initConfig.draggable) {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/draggabilly@3/dist/draggabilly.pkgd.min.js';
                document.head.appendChild(script);
                script.onload = () => {
                    console.log('draggabilly loaded');
                    // Make existing floater draggable
                    const existingFloater = document.getElementById('genai-floater');
                    if (existingFloater && (window as any).Draggabilly) {
                        initializeDraggability(existingFloater);
                    }
                };
                script.onerror = () => {
                    console.warn('Failed to load draggabilly, floater will remain static');
                };
            }
        } else {
            // Dialog mode - render dialog directly without floater
            const loadingOverlay = createLoadingOverlay();

            try {
                await loadDialogApp(initConfig);
                removeLoadingOverlay(loadingOverlay);
            } catch (error) {
                console.error('Failed to load GenAI content in dialog:', error);
                removeLoadingOverlay(loadingOverlay);
            }
        }
    } catch (error) {
        console.error('Failed to initialize GenAI SDK:', error);
    }
}

export function destroy() {
    if (appInstance?.unmount) {
        appInstance.unmount();
        appInstance = null;
    }
    if (floater) {
        floater.remove();
        floater = null;
    }
    removePersistentEventListener();
    currentConfig = null;
}

// Attach to window for script tag usage
if (typeof window !== 'undefined') {
    (window as any).GenAISDK = {
        init,
        destroy,
    };
}
