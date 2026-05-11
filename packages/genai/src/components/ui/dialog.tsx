import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot='dialog' {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot='dialog-close' {...props} />;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot='dialog-overlay'
            className={cn(
                'gai:will-change-opacity gai:fixed gai:inset-0 gai:z-[9999] gai:bg-black/50 gai:transition-opacity gai:duration-150 gai:data-[state=closed]:opacity-0 gai:data-[state=open]:opacity-100',
                className
            )}
            {...props}
        />
    );
}

function DialogContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
}) {
    return (
        <DialogPortal container={document.querySelector('.genai-sdk-container')} data-slot='dialog-portal'>
            <DialogOverlay />
            <DialogPrimitive.Content
                data-slot='dialog-content'
                className={cn(
                    'genai-sdk-container gai:font-inter',
                    'sm:gai:max-w-lg gai:will-change-opacity gai:fixed gai:top-[50%] gai:left-[50%] gai:z-[9999] gai:grid gai:w-full gai:max-w-[calc(100%-2rem)] gai:translate-x-[-50%] gai:translate-y-[-50%] gai:gap-4 gai:rounded-lg gai:border gai:bg-background gai:p-6 gai:shadow-lg gai:transition-opacity gai:duration-150 gai:data-[state=closed]:opacity-0 gai:data-[state=open]:opacity-100',
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        data-slot='dialog-close'
                        className="focus:gai:ring-ring focus:gai:ring-2 focus:gai:ring-offset-2 focus:gai:outline-hidden [&_svg]:gai:pointer-events-none [&_svg]:gai:shrink-0 [&_svg:not([class*='size-'])]:gai:size-4 gai:absolute gai:top-4 gai:right-4 gai:rounded-xs gai:opacity-70 gai:ring-offset-background gai:transition-opacity gai:hover:opacity-100 gai:disabled:pointer-events-none gai:data-[state=open]:bg-accent gai:data-[state=open]:text-muted-foreground"
                    >
                        <XIcon />
                        <span className='gai:sr-only'>Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot='dialog-header'
            className={cn('sm:gai:text-left gai:flex gai:flex-col gai:gap-2 gai:text-center', className)}
            {...props}
        />
    );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot='dialog-footer'
            className={cn('sm:gai:flex-row sm:gai:justify-end gai:flex gai:flex-col-reverse gai:gap-2', className)}
            {...props}
        />
    );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return <DialogPrimitive.Title data-slot='dialog-title' className={className} {...props} />;
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return <DialogPrimitive.Description data-slot='dialog-description' className={className} {...props} />;
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
