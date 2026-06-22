import { DialogView } from '../dialog/DialogView';
import type { ViewShellProps } from '../types';

/**
 * Floater view — renders the same dialog UI as `DialogView`. The visual
 * floater button is managed by `SDKLifecycle` + `floaterDraggable`; this shell
 * only handles the open/minimize/close state when the dialog is showing.
 */
export function FloaterView(props: ViewShellProps) {
    return <DialogView {...props} />;
}
