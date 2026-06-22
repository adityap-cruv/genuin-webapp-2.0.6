import { useEffect, useState } from 'react';

import AppContent from '@/components/AppContent';
import { AnimatedDialog, AnimatedDialogContent } from '@/components/ui/animated-dialog';
import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import { hideFloater, showFloater } from '@/styles/floaterStyles';

import { DialogHeader } from '../shared/DialogHeader';
import type { ViewShellProps } from '../types';

/**
 * Dialog view — modal overlay version of the chat experience.
 * Minimize collapses to the floater button; close runs the SDK cleanup callback.
 */
export function DialogView({ onClose }: ViewShellProps) {
    const [open, setOpen] = useState(true);

    // Re-open the dialog when the host page dispatches genai:openDialog.
    useEffect(() => eventBus.on(EVENTS.OPEN_DIALOG, () => setOpen(true)), []);

    // Hide the floater while the dialog is mounted; restore on unmount.
    useEffect(() => {
        hideFloater();
        return () => {
            showFloater();
        };
    }, []);

    const handleMinimize = () => {
        setOpen(false);
        showFloater();
    };

    const handleClose = () => {
        setOpen(false);
        // Wait for the dialog close animation before tearing down DOM.
        setTimeout(() => {
            showFloater();
            onClose?.();
        }, 300);
    };

    return (
        <AnimatedDialog
            open={open}
            onOpenChange={isOpen => {
                if (!isOpen) handleMinimize();
            }}
        >
            <AnimatedDialogContent
                className='gai:flex gai:h-full gai:max-w-none gai:flex-col gai:gap-0 gai:overflow-hidden gai:rounded-2xl gai:border-none gai:p-0'
                showCloseButton={false}
            >
                <DialogHeader onMinimize={handleMinimize} onClose={handleClose} />
                <div className='gai:flex-1 gai:overflow-hidden'>
                    <AppContent />
                </div>
            </AnimatedDialogContent>
        </AnimatedDialog>
    );
}
