import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock App to keep tests fast + avoid full provider tree
vi.mock('./App', () => ({
    default: () => null,
}));

import type { AppProps } from './App';
import { mount, mountWithDialog, mountWithFloater } from './mount';

const dummyProps: AppProps = { userId: 'u1', brandId: 1 };

describe('mount', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container.parentNode) container.parentNode.removeChild(container);
        document.querySelectorAll('.genai-sdk-container, .genai-sdk-floater-container').forEach(el =>
            el.parentNode?.removeChild(el)
        );
        delete (window as any).GenAISDK;
    });

    it('renders into the supplied container and returns a cleanup function', async () => {
        const cleanup = await mount(container, dummyProps);
        expect(typeof cleanup).toBe('function');
        cleanup();
    });
});

describe('mountWithDialog', () => {
    afterEach(() => {
        document.querySelectorAll('.genai-sdk-container, .genai-sdk-floater-container').forEach(el =>
            el.parentNode?.removeChild(el)
        );
        delete (window as any).GenAISDK;
    });

    it('creates a .genai-sdk-container at body level when none exists', async () => {
        expect(document.querySelector('.genai-sdk-container')).toBeNull();
        const cleanup = await mountWithDialog(dummyProps);
        expect(document.querySelector('.genai-sdk-container')).not.toBeNull();
        cleanup();
    });

    it('reuses an existing .genai-sdk-container instead of creating a duplicate', async () => {
        const existing = document.createElement('div');
        existing.className = 'genai-sdk-container';
        document.body.appendChild(existing);
        const cleanup = await mountWithDialog(dummyProps);
        expect(document.querySelectorAll('.genai-sdk-container').length).toBe(1);
        cleanup();
    });

    it('cleanup removes the container and resets window.GenAISDK.forceOpen', async () => {
        (window as any).GenAISDK = { forceOpen: false };
        const cleanup = await mountWithDialog(dummyProps);
        cleanup();
        expect(document.querySelector('.genai-sdk-container')).toBeNull();
        expect((window as any).GenAISDK.forceOpen).toBe(true);
    });
});

describe('mountWithFloater', () => {
    afterEach(() => {
        document.querySelectorAll('.genai-sdk-container, .genai-sdk-floater-container').forEach(el =>
            el.parentNode?.removeChild(el)
        );
        delete (window as any).GenAISDK;
    });

    it('creates a container with both floater + sdk classes', async () => {
        const cleanup = await mountWithFloater(dummyProps);
        const el = document.querySelector('.genai-sdk-floater-container');
        expect(el).not.toBeNull();
        expect(el?.classList.contains('genai-sdk-container')).toBe(true);
        cleanup();
    });
});
