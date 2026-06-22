import { AnimatedDialogHeader } from '@/components/ui/animated-dialog';

import { CloseButton } from './CloseButton';
import { MinimizeButton } from './MinimizeButton';

interface DialogHeaderProps {
    onMinimize: () => void;
    onClose: () => void;
}

/**
 * Header chrome reused by dialog + floater views.
 * Hosts minimize + close buttons; clicking each calls its respective callback.
 */
export function DialogHeader({ onMinimize, onClose }: DialogHeaderProps) {
    return (
        <AnimatedDialogHeader className='gai:flex gai:flex-shrink-0 gai:flex-row gai:items-center gai:justify-between gai:bg-primary-50 gai:p-4'>
            <MinimizeButton onClick={onMinimize} />
            <CloseButton onClick={onClose} />
        </AnimatedDialogHeader>
    );
}
