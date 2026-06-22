import type { ViewModule, ViewName } from './types';

/** Lazy view loaders — only the view a host needs is fetched. */
const loaders: Record<ViewName, () => Promise<{ default: ViewModule }>> = {
    page: () => import('./page'),
    dialog: () => import('./dialog'),
    floater: () => import('./floater'),
    'web-sdk': () => import('./web-sdk'),
};

/**
 * Resolve a view name to its `ViewModule`. Throws if the name isn't registered.
 *
 * @throws {Error} `Unknown view: <name>` if `name` isn't in the loaders map.
 */
export async function loadView(name: ViewName): Promise<ViewModule> {
    const loader = loaders[name];
    if (!loader) throw new Error(`Unknown view: ${name}`);
    return (await loader()).default;
}
