import { describe, expect, it } from 'vitest';

import { loadView } from './registry';

describe('views/registry', () => {
    describe('loadView', () => {
        it.each(['page', 'dialog', 'floater', 'web-sdk'] as const)(
            'resolves a ViewModule with matching name for %s',
            async (name) => {
                const view = await loadView(name);
                expect(view.name).toBe(name);
                expect(view.Shell).toBeDefined();
                expect(view.mountStrategy).toBeDefined();
            }
        );

        it('rejects unknown view names with a clear error', async () => {
            // @ts-expect-error - intentional bad input for the test
            await expect(loadView('bogus')).rejects.toThrow('Unknown view: bogus');
        });

        it('page view uses inline-container mount strategy', async () => {
            const view = await loadView('page');
            expect(view.mountStrategy.kind).toBe('inline-container');
        });

        it('dialog view uses auto-container mount strategy', async () => {
            const view = await loadView('dialog');
            expect(view.mountStrategy.kind).toBe('auto-container');
        });

        it('floater view uses floater mount strategy', async () => {
            const view = await loadView('floater');
            expect(view.mountStrategy.kind).toBe('floater');
        });

        it('web-sdk view uses inline-container mount strategy', async () => {
            const view = await loadView('web-sdk');
            expect(view.mountStrategy.kind).toBe('inline-container');
        });
    });
});
