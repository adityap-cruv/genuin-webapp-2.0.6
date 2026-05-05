import * as React from 'react';
import ReactDOM from 'react-dom';

import { cn } from '@/lib/utils';

interface AnimatedDialogProps {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

function AnimatedDialog({ open, onOpenChange, children }: AnimatedDialogProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        if (open) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            setIsVisible(true);
            setIsClosing(false);
        } else if (isVisible) {
            setIsClosing(true);
            timerRef.current = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
                timerRef.current = null;
            }, 200);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [open]);

    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && onOpenChange && isVisible) {
                // Check if a video is in fullscreen mode by looking for fullscreen elements
                const hasFullscreenVideo = document.querySelector('.gen-sdk-expand-open') !== null;

                // Only close dialog if no video is in fullscreen
                if (!hasFullscreenVideo) {
                    onOpenChange(false);
                }
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isVisible, onOpenChange]);

    if (!isVisible) return null;

    return (
        <div
            data-slot='animated-dialog'
            data-state={isClosing ? 'closed' : 'open'}
            className='gai:relative gai:isolate'
        >
            {React.cloneElement(children as React.ReactElement<AnimatedDialogContentProps>, { isClosing })}
        </div>
    );
}

interface AnimatedDialogContentProps {
    className?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    isClosing?: boolean;
}

function AnimatedDialogContent({
    className,
    children,
    showCloseButton = true,
    isClosing = false,
    ...props
}: AnimatedDialogContentProps & React.HTMLAttributes<HTMLDivElement>) {
    const portalContainer = document.querySelector('.genai-sdk-container') || document.body;

    // Ensure our portal container has the highest stacking context
    React.useEffect(() => {
        if (portalContainer) {
            const originalStyle = portalContainer.getAttribute('style') || '';
            // portalContainer.setAttribute('style', `position: relative;`);

            return () => {
                portalContainer.setAttribute('style', originalStyle);
            };
        }
    }, [portalContainer]);

    const content = (
        <div
            data-slot='animated-dialog-root'
            className='gai:fixed gai:inset-0 gai:z-[9999] gai:flex gai:items-center gai:justify-center gai:p-4'
        >
            <div
                data-slot='animated-dialog-overlay'
                className={cn(
                    'gai:fixed gai:inset-0 gai:bg-black/50 gai:duration-300',
                    isClosing ? 'gai:animate-out gai:fade-out-0' : 'gai:animate-in gai:fade-in-0'
                )}
            />
            <div
                data-slot='animated-dialog-content'
                className={cn(
                    'genai-sdk-container gai:font-inter',
                    'gai:relative gai:w-full gai:max-w-lg gai:rounded-lg gai:border gai:bg-background gai:p-6 gai:shadow-lg gai:duration-300',
                    isClosing
                        ? 'gai:animate-out gai:fade-out-0 gai:zoom-out-95 gai:slide-out-to-bottom-4'
                        : 'gai:animate-in gai:fade-in-0 gai:zoom-in-95 gai:slide-in-from-bottom-4',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </div>
    );

    if (typeof window !== 'undefined') {
        return ReactDOM.createPortal(content, portalContainer);
    }

    return content;
}

function AnimatedDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot='animated-dialog-header'
            className={cn('sm:gai:text-left gai:flex gai:flex-col gai:gap-2 gai:text-center', className)}
            {...props}
        />
    );
}

export { AnimatedDialog, AnimatedDialogContent, AnimatedDialogHeader };
