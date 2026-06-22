import type { ComponentType } from 'react';

import type { SDKConfig } from '@/core/SDKLifecycle';

export type ViewName = 'page' | 'dialog' | 'floater' | 'web-sdk';

/** How the SDK should create the DOM container for this view at init time. */
export type ViewMountStrategy =
    | { kind: 'inline-container' }
    | { kind: 'auto-container'; className: string }
    | { kind: 'floater' };

/** Props passed to every view shell. Shells may ignore what they don't need. */
export interface ViewShellProps {
    onClose?: () => void;
}

export interface ViewModule {
    name: ViewName;
    Shell: ComponentType<ViewShellProps>;
    mountStrategy: ViewMountStrategy;
    /** Optional pre-mount hook for view-specific setup (e.g. floater draggable). */
    onBeforeMount?: (config: SDKConfig) => Promise<void> | void;
}
