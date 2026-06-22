import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '@/utils/cn';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root data-slot='popover' {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
    return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />;
}

function PopoverContent({
    className,
    align = 'center',
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
    return (
        <PopoverPrimitive.Portal container={document.querySelector('.genai-sdk-container')}>
            <PopoverPrimitive.Content
                data-slot='popover-content'
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'genai-sdk-container gai:font-inter',
                    'gai:will-change-opacity gai:z-[9999] gai:w-72 gai:origin-(--radix-popover-content-transform-origin) gai:rounded-md gai:border gai:bg-popover gai:p-4 gai:text-popover-foreground gai:shadow-md gai:outline-hidden gai:transition-opacity gai:duration-150 gai:data-[state=closed]:opacity-0 gai:data-[state=open]:opacity-100',
                    className
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
    return <PopoverPrimitive.Anchor data-slot='popover-anchor' {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
