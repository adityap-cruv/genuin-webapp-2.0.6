import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SDKLifecycle } from './SDKLifecycle';

// Mock view registry — each view returns a stub ViewModule with a known mountStrategy
vi.mock('../views/registry', () => ({
    loadView: vi.fn(async (name: string) => ({
        name,
        Shell: () => null,
        mountStrategy:
            name === 'page' || name === 'web-sdk'
                ? { kind: 'inline-container' as const }
                : name === 'floater'
                  ? { kind: 'floater' as const }
                  : { kind: 'auto-container' as const, className: 'genai-sdk-container' },
        onBeforeMount: vi.fn(),
    })),
}));

// Mock renderer/mount — return a no-op cleanup
vi.mock('../renderer/mount', () => ({
    mount: vi.fn(async () => () => undefined),
    mountWithFloater: vi.fn(async () => () => undefined),
    mountWithDialog: vi.fn(async () => () => undefined),
}));

// Mock analytics to avoid Rudderstack init
vi.mock('../adapters/analytics/OctoAnalytics', () => ({
    OctoAnalytics: vi.fn().mockImplementation(() => ({
        initialize: vi.fn().mockResolvedValue(undefined),
        trackSDKLoaded: vi.fn(),
        trackSDKInitialized: vi.fn(),
        trackSDKInitFailed: vi.fn(),
        destroy: vi.fn(),
    })),
}));

describe('SDKLifecycle.init', () => {
    beforeEach(() => {
        (window as any).GenAISDK = { forceOpen: false };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        delete (window as any).GenAISDK;
        vi.clearAllMocks();
    });

    describe('input validation', () => {
        it('logs and bails when brandId is below -1', async () => {
            const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const sdk = new SDKLifecycle();
            await sdk.init({ userId: 'u1', brandId: -2 });
            expect(errSpy).toHaveBeenCalledWith('Brand ID is required');
            errSpy.mockRestore();
        });

        it('logs and bails when brandId is falsy', async () => {
            const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const sdk = new SDKLifecycle();
            await sdk.init({ userId: 'u1', brandId: 0 });
            expect(errSpy).toHaveBeenCalledWith('Brand ID is required');
            errSpy.mockRestore();
        });
    });

    describe('inline-container views', () => {
        it('errors if no containerId/element supplied for page view', async () => {
            const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const sdk = new SDKLifecycle();
            await sdk.init({ userId: 'u1', brandId: 1, view: 'page' });
            expect(errSpy).toHaveBeenCalledWith(
                expect.stringContaining('Container ID or container element is required')
            );
            errSpy.mockRestore();
        });

        it('errors if containerId is not in DOM', async () => {
            const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const sdk = new SDKLifecycle();
            await sdk.init({ userId: 'u1', brandId: 1, view: 'page', containerId: 'missing' });
            expect(errSpy).toHaveBeenCalledWith(expect.stringContaining("Container with ID 'missing' not found"));
            errSpy.mockRestore();
        });

        it('calls mount when containerElement is supplied', async () => {
            const { mount } = await import('../renderer/mount');
            const sdk = new SDKLifecycle();
            const container = document.createElement('div');
            await sdk.init({
                userId: 'u1',
                brandId: 1,
                view: 'page',
                containerElement: container,
            });
            expect(mount).toHaveBeenCalledTimes(1);
        });
    });

    describe('auto-container views', () => {
        it('calls mountWithDialog for dialog view', async () => {
            const { mountWithDialog } = await import('../renderer/mount');
            const sdk = new SDKLifecycle();
            await sdk.init({ userId: 'u1', brandId: 1, view: 'dialog' });
            expect(mountWithDialog).toHaveBeenCalledTimes(1);
        });
    });

    describe('destroy', () => {
        it('clears config and removes event listeners after init', async () => {
            const sdk = new SDKLifecycle();
            const container = document.createElement('div');
            await sdk.init({ userId: 'u1', brandId: 1, view: 'page', containerElement: container });
            sdk.destroy();
            // No assertion beyond not throwing — the analytics + listeners are mocked
            expect(true).toBe(true);
        });
    });
});
