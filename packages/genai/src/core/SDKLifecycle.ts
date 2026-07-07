import { OctoAnalytics } from '../adapters/analytics/OctoAnalytics';
import type { AutoPromptConfig, LegacyAutoPromptConfig } from '../modules/lifecycle/auto-prompt-config';
import { createFloaterElement, showFloaterSpinner } from '../styles/floaterStyles';
import type { PendingMessage } from '../types';
import { attachDraggableHandlers, type DraggieLike } from '../views/floater/floaterDraggable';
import { loadView } from '../views/registry';
import type { ViewModule, ViewName } from '../views/types';

import { eventBus } from './events/EventBus';
import { EVENTS } from './events/eventRegistry';

export interface SDKConfig {
    containerId?: string;
    containerElement?: HTMLElement;
    userId: string;
    brandId: number;
    sessionId?: string;
    view?: 'page' | 'floater' | 'dialog' | 'web-sdk';
    renderMode?: 'compact' | 'full';
    /**
     * UI density level for the ad slot hosting this SDK instance.
     * Controls the scale of all sizing-sensitive UI elements from init.
     * - `'xs'`   — compact strips (320×100, 320×50)
     * - `'sm'`   — larger ad tiles (300×250 split view)
     * - `'base'` — standard full UI (default, omit for normal usage)
     */
    uiDensity?: 'xs' | 'sm' | 'base';
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
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
    autoPromptConfig?: AutoPromptConfig | LegacyAutoPromptConfig;
}

export class SDKLifecycle {
    private appInstance: { unmount: () => void } | null = null;
    private floater: HTMLElement | null = null;
    private config: SDKConfig | null = null;
    private persistentEventUnsub: (() => void) | null = null;
    private messageEventUnsub: (() => void) | null = null;
    private pendingMessages: Array<PendingMessage> = [];
    private analytics: OctoAnalytics | null = null;
    private readonly loadTime = Date.now();

    // --- DOM helpers ---

    private createFloater(): HTMLElement {
        if (this.floater) {
            this.floater.remove();
            this.floater = null;
        }
        this.floater = createFloaterElement(this.config?.draggable);
        return this.floater;
    }

    private showLoadingState(container: HTMLElement): void {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'center';
        div.style.alignItems = 'center';
        div.style.height = '100%';
        div.style.width = '100%';
        div.innerHTML = '<div></div>';
        container.innerHTML = '';
        container.appendChild(div);
    }

    isMounted(): boolean {
        return document.querySelector('.genai-sdk-container') !== null;
    }

    private createLoadingOverlay(): HTMLElement {
        const overlay = document.createElement('div');
        overlay.id = 'genai-loading-overlay';
        overlay.innerHTML = `
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
        document.body.appendChild(overlay);
        return overlay;
    }

    private removeLoadingOverlay(overlay?: HTMLElement | null): void {
        const target = overlay || document.getElementById('genai-loading-overlay');
        if (target?.parentNode) {
            target.parentNode.removeChild(target);
        }
    }

    // --- App mounting ---

    /**
     * Build the AppProps payload from a SDKConfig. Single source of truth
     * for what every mount fn receives.
     */
    private buildAppProps(config: SDKConfig, view: ViewName) {
        return {
            view,
            userId: config.userId,
            brandId: config.brandId,
            sessionId: view === 'web-sdk' ? undefined : config.sessionId,
            renderMode: config.renderMode,
            uiDensity: config.uiDensity,
            pendingMessages: [...this.pendingMessages],
            userEmail: config.userEmail,
            userUUID: config.userUUID,
            isMaya: config.isMaya,
            parentWebSdkInstanceId: config.parentWebSdkInstanceId,
            parentWebSdkContainerId: config.parentWebSdkContainerId,
            parentWebSdkEmbedId: config.parentWebSdkEmbedId,
            parentWebSdkPlacementId: config.parentWebSdkPlacementId,
            parentOctoPanelId: config.parentOctoPanelId,
            videoId: config.videoId,
            integrationType: config.integrationType,
            integrationId: config.integrationId,
            contentOrder: config.contentOrder,
            autoPromptConfig: config.autoPromptConfig,
        };
    }

    /** Mount the React app for a view that uses an auto-created body-level container. */
    private async mountAutoContainerView(view: 'dialog' | 'floater', config: SDKConfig): Promise<void> {
        const { mountWithDialog, mountWithFloater } = await import('../renderer/mount');
        const mountFn = view === 'floater' ? mountWithFloater : mountWithDialog;
        this.appInstance = { unmount: await mountFn(this.buildAppProps(config, view)) };
        this.pendingMessages = [];
    }

    /** Wire Draggabilly handlers onto the floater DOM element. */
    private initializeDraggability(floaterElement: HTMLElement): void {
        try {
            const draggie = new (window as any).Draggabilly(floaterElement, {
                containment: 'body',
            }) as DraggieLike;
            attachDraggableHandlers(draggie, floaterElement);
        } catch (err) {
            console.error('Error initializing Draggabilly:', err);
        }
    }

    // --- Event listeners ---

    setupPersistentEventListener(): void {
        if (this.persistentEventUnsub) return;

        const openDialogHandler = async (detail: { isMaya?: boolean } | null | void) => {
            const isMayaFromEvent = detail?.isMaya;
            const currentIsMaya = this.config?.isMaya ?? false;
            const requestedIsMaya = isMayaFromEvent ?? false;

            if (this.config && isMayaFromEvent !== undefined && currentIsMaya !== requestedIsMaya) {
                this.config = { ...this.config, isMaya: isMayaFromEvent };

                if (this.appInstance?.unmount) {
                    this.appInstance.unmount();
                    this.appInstance = null;
                }

                if (this.config.view === 'floater') {
                    showFloaterSpinner();
                    await this.mountAutoContainerView('floater', this.config);
                } else if (this.config.view === 'dialog') {
                    const overlay = this.createLoadingOverlay();
                    try {
                        await this.mountAutoContainerView('dialog', this.config);
                        this.removeLoadingOverlay(overlay);
                    } catch (error) {
                        console.error('Failed to load GenAI content in dialog:', error);
                        this.removeLoadingOverlay(overlay);
                    }
                }
                return;
            }

            // eslint-disable-next-line react/no-is-mounted -- SDKLifecycle is a plain class with its own isMounted() method; not the React component API.
            if (this.isMounted() && !(window as any).GenAISDK?.forceOpen) return;

            (window as any).GenAISDK.forceOpen = false;

            if (this.config) {
                if (this.config.view === 'floater') {
                    showFloaterSpinner();
                    await this.mountAutoContainerView('floater', this.config);
                } else if (this.config.view === 'dialog') {
                    const overlay = this.createLoadingOverlay();
                    try {
                        await this.mountAutoContainerView('dialog', this.config);
                        this.removeLoadingOverlay(overlay);
                    } catch (error) {
                        console.error('Failed to load GenAI content in dialog:', error);
                        this.removeLoadingOverlay(overlay);
                    }
                } else {
                    // Reinitialize page/web-sdk view

                    (window as any).GenAISDK?.init(this.config);
                }
            } else {
                console.warn('No stored config available for reinitialization');
            }
        };

        this.persistentEventUnsub = eventBus.on(EVENTS.OPEN_DIALOG, openDialogHandler);

        if (!this.messageEventUnsub) {
            this.messageEventUnsub = eventBus.on(EVENTS.MESSAGE, detail => {
                const safe: Partial<NonNullable<typeof detail>> = detail ?? {};
                const { message, agent_id, session_id } = safe;

                if (!message) {
                    console.warn('genai:message event requires a message');
                    return;
                }

                // eslint-disable-next-line react/no-is-mounted -- SDKLifecycle is a plain class with its own isMounted() method; not the React component API.
                if (!this.isMounted()) {
                    this.pendingMessages.push({ message, agent_id, session_id });
                    if (this.pendingMessages.length === 1) {
                        eventBus.emit(EVENTS.OPEN_DIALOG, undefined);
                    }
                } else {
                    eventBus.emit(EVENTS.SEND_MESSAGE, { message, agent_id, session_id });
                }
            });
        }
    }

    private removePersistentEventListener(): void {
        if (this.persistentEventUnsub) {
            this.persistentEventUnsub();
            this.persistentEventUnsub = null;
        }
        if (this.messageEventUnsub) {
            this.messageEventUnsub();
            this.messageEventUnsub = null;
        }
    }

    // --- Analytics ---

    private initAnalytics(config: SDKConfig): void {
        if (this.analytics) return;

        const rudderstackWriteKey = import.meta.env.VITE_GENAI_RUDDERSTACK_KEY ?? '';
        const rudderstackDataplaneUrl = import.meta.env.VITE_GENAI_RUDDERSTACK_URL ?? '';
        const environment = import.meta.env.MODE === 'production' ? 'production' : 'development';

        this.analytics = new OctoAnalytics({
            userId: config.userId,
            brandId: config.brandId,
            rudderstackWriteKey,
            rudderstackDataplaneUrl,
            environment,
            parentWebSdkInstanceId: config.parentWebSdkInstanceId,
            parentWebSdkContainerId: config.parentWebSdkContainerId,
            parentWebSdkEmbedId: config.parentWebSdkEmbedId,
            parentWebSdkPlacementId: config.parentWebSdkPlacementId,
            parentOctoPanelId: config.parentOctoPanelId,
            videoId: config.videoId,
            debug: import.meta.env.MODE !== 'production',
        });

        this.analytics
            .initialize()
            .then(() => {
                this.analytics?.trackSDKLoaded({
                    load_time: Date.now() - this.loadTime,

                    sdk_version: (window as any).GenAISDK?.version || '1.0.0',
                });
            })
            .catch(error => {
                console.error('[GenAI SDK] Failed to initialize analytics:', error);
            });
    }

    // --- Public API ---

    setWebSdkRenderMode(mode: 'compact' | 'full'): void {
        if (!this.config) {
            console.warn('[GenAI SDK] Cannot set render mode before initialization');
            return;
        }
        if (this.config.view !== 'web-sdk') {
            console.warn('[GenAI SDK] Render mode changes are only applicable in web-sdk view');
            return;
        }
        if (this.config.renderMode === mode) return;

        this.config = { ...this.config, renderMode: mode };

        eventBus.emit(EVENTS.WEB_SDK_RENDER_MODE, {
            mode,
            parentOctoPanelId: this.config.parentOctoPanelId,
        });
    }

    async init(initConfig: SDKConfig): Promise<void> {
        const viewMode = initConfig.view || 'dialog';
        const normalizedRenderMode = initConfig.renderMode ?? (viewMode === 'web-sdk' ? 'full' : undefined);

        const normalizedConfig: SDKConfig = { ...initConfig, view: viewMode };
        if (normalizedRenderMode) {
            normalizedConfig.renderMode = normalizedRenderMode;
        }

        this.config = normalizedConfig;

        (window as any).GenAISDK.forceOpen = true;

        if (this.appInstance) return;

        if (!normalizedConfig.brandId || !normalizedConfig.userId) {
            console.error('Brand ID is required');
            return;
        }
        if (normalizedConfig.brandId < -1) {
            console.error('Brand ID is required');
            return;
        }

        this.initAnalytics(normalizedConfig);
        this.setupPersistentEventListener();

        try {
            const viewModule = await loadView(viewMode as ViewName);
            await viewModule.onBeforeMount?.(normalizedConfig);
            await this.dispatchByMountStrategy(viewModule, normalizedConfig);

            this.analytics?.trackSDKInitialized({
                view: viewMode,
                init_time: Date.now() - this.loadTime,
            });
        } catch (error) {
            console.error('Failed to initialize GenAI SDK:', error);
            this.analytics?.trackSDKInitFailed({
                error_message: error instanceof Error ? error.message : 'Unknown error',
                error_code: 'SDK_INIT_ERROR',
            });
        }
    }

    /**
     * Branch on the view's mountStrategy to set up the DOM container and mount the app.
     * `inline-container` requires a host-supplied containerId/Element; `auto-container`
     * creates a body-level container with the configured className; `floater` builds
     * the floater button and (if `draggable`) wires Draggabilly handlers.
     */
    private async dispatchByMountStrategy(view: ViewModule, config: SDKConfig): Promise<void> {
        switch (view.mountStrategy.kind) {
            case 'inline-container': {
                if (!config.containerId && !config.containerElement) {
                    console.error(`Container ID or container element is required for ${view.name} view`);
                    return;
                }
                const container =
                    config.containerElement ||
                    (config.containerId ? document.getElementById(config.containerId) : null);
                if (!container) {
                    console.error(`Container with ID '${config.containerId}' not found`);
                    return;
                }
                this.showLoadingState(container);
                const { mount } = await import('../renderer/mount');
                this.appInstance = {
                    unmount: await mount(container, this.buildAppProps(config, view.name)),
                };
                this.pendingMessages = [];
                return;
            }
            case 'auto-container': {
                const overlay = this.createLoadingOverlay();
                try {
                    await this.mountAutoContainerView('dialog', config);
                    this.removeLoadingOverlay(overlay);
                } catch (error) {
                    this.removeLoadingOverlay(overlay);
                    throw error;
                }
                return;
            }
            case 'floater': {
                this.createFloater();
                if (!config.draggable) return;
                // onBeforeMount already loaded the Draggabilly script.
                const floaterEl = document.getElementById('genai-floater');
                if (floaterEl && (window as any).Draggabilly) {
                    this.initializeDraggability(floaterEl);
                }
                return;
            }
        }
    }

    destroy(): void {
        if (this.appInstance?.unmount) {
            try {
                this.appInstance.unmount();
            } catch (error) {
                console.error('[GenAI SDK] Failed to unmount React app:', error);
            }
            this.appInstance = null;
        }

        if (this.floater) {
            this.floater.remove();
            this.floater = null;
        }

        if (this.analytics) {
            this.analytics.destroy();
            this.analytics = null;
        }

        this.removePersistentEventListener();
        this.config = null;
    }
}
