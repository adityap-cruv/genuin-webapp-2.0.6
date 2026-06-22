import type { ViewShellProps } from '../types';

import { WebSdkContent } from './WebSdkContent';

/** Embedded SDK view — host page provides the container, no chrome. */

export function WebSdkView(_props: ViewShellProps) {
    return <WebSdkContent />;
}
