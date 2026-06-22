import { useEffect, type DependencyList } from 'react';

import { eventBus } from './EventBus';
import type { EventHandler } from './EventBus';
import type { EventName } from './eventRegistry';

/**
 * React convenience wrapper around `eventBus.on`. Subscribes on mount /
 * when `deps` change and unsubscribes automatically. The bus itself
 * stays React-free; this hook is purely sugar.
 */
export function useEventBusListener<K extends EventName>(
    name: K,
    handler: EventHandler<K>,
    deps: DependencyList
): void {
    useEffect(
        () => eventBus.on(name, handler),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps
    );
}
