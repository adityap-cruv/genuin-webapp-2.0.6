import AppContent from '@/components/AppContent';

import type { ViewShellProps } from '../types';

/** Inline page view — renders directly into the host-supplied container. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PageView(_props: ViewShellProps) {
    return <AppContent />;
}
