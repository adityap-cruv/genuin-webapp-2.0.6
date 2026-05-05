import * as SelectPrimitive from '@radix-ui/react-select';
import * as React from 'react';

import ChevronDown from '@/assets/SvgIcons/ChevronDown';
import { cn } from '@/lib/utils';

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot='select' {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
    return <SelectPrimitive.Group data-slot='select-group' {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return <SelectPrimitive.Value data-slot='select-value' {...props} />;
}

function SelectTrigger({
    className,
    size = 'default',
    showChevron = true,
    children,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: 'sm' | 'default';
    showChevron?: boolean;
}) {
    return (
        <SelectPrimitive.Trigger
            data-slot='select-trigger'
            data-size={size}
            className={cn(
                'gai:flex gai:w-fit gai:items-center gai:justify-between gai:gap-2 gai:rounded-md gai:border gai:border-input gai:bg-transparent gai:px-3 gai:py-2 gai:text-sm gai:whitespace-nowrap gai:transition-[color,box-shadow] gai:outline-none',
                // 'gai:focus-visible:border-ring gai:focus-visible:ring-[3px] gai:focus-visible:ring-ring/50',
                'gai:disabled:cursor-not-allowed gai:disabled:opacity-50',
                // 'gai:data-[size=default]:h-9 gai:data-[size=sm]:h-8',
                'gai:*:data-[slot=select-value]:line-clamp-1 gai:*:data-[slot=select-value]:flex gai:*:data-[slot=select-value]:items-center gai:*:data-[slot=select-value]:gap-2',
                "gai:[&_svg]:pointer-events-none gai:[&_svg]:shrink-0 gai:[&_svg:not([class*='size-'])]:size-4",
                'gai:dark:bg-input/30 gai:dark:hover:bg-input/50',
                'gai:aria-invalid:border-destructive gai:aria-invalid:ring-destructive/20 gai:dark:aria-invalid:ring-destructive/40',
                className
            )}
            {...props}
        >
            {children}
            {showChevron && (
                <SelectPrimitive.Icon asChild>
                    <ChevronDown className='gai:size-4 gai:opacity-50' />
                </SelectPrimitive.Icon>
            )}
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    children,
    position = 'popper',
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
    return (
        <SelectPrimitive.Portal container={document.querySelector('.genai-sdk-container')}>
            <SelectPrimitive.Content
                data-slot='select-content'
                className={cn(
                    'gai:font-inter',
                    'gai:relative gai:isolate gai:z-[9999] gai:min-w-[8rem] gai:overflow-hidden gai:rounded-md gai:border gai:bg-popover gai:text-popover-foreground gai:shadow-md',
                    'gai:data-[state=closed]:animate-out gai:data-[state=closed]:fade-out-0 gai:data-[state=closed]:zoom-out-95 gai:data-[state=open]:animate-in gai:data-[state=open]:fade-in-0 gai:data-[state=open]:zoom-in-95',
                    'gai:data-[side=bottom]:slide-in-from-top-2 gai:data-[side=left]:slide-in-from-right-2 gai:data-[side=right]:slide-in-from-left-2 gai:data-[side=top]:slide-in-from-bottom-2',
                    position === 'popper' &&
                        'gai:data-[side=bottom]:translate-y-1 gai:data-[side=left]:-translate-x-1 gai:data-[side=right]:translate-x-1 gai:data-[side=top]:-translate-y-1',
                    className
                )}
                position={position}
                {...props}
            >
                {/* <SelectScrollUpButton /> */}
                <SelectPrimitive.Viewport
                    className={cn(
                        'gai:p-1',
                        position === 'popper' &&
                            'gai:h-[var(--radix-select-trigger-height)] gai:w-full gai:min-w-[var(--radix-select-trigger-width)] gai:scroll-my-1'
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                {/* <SelectScrollDownButton /> */}
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
    return (
        <SelectPrimitive.Label
            data-slot='select-label'
            className={cn('gai:px-2 gai:py-1.5 gai:text-xs gai:text-muted-foreground', className)}
            {...props}
        />
    );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
    return (
        <SelectPrimitive.Item
            data-slot='select-item'
            className={cn(
                'gai:relative gai:flex gai:w-full gai:cursor-default gai:items-center gai:gap-2 gai:rounded-sm gai:py-1.5 gai:pr-8 gai:pl-2 gai:text-sm gai:outline-hidden gai:select-none',
                'gai:focus:bg-accent gai:focus:text-accent-foreground',
                'gai:data-[disabled]:pointer-events-none gai:data-[disabled]:opacity-50',
                "gai:[&_svg]:pointer-events-none gai:[&_svg]:shrink-0 gai:[&_svg:not([class*='size-'])]:size-4",
                'gai:*:[span]:last:flex gai:*:[span]:last:items-center gai:*:[span]:last:gap-2',
                className
            )}
            {...props}
        >
            <span className='gai:absolute gai:right-2 gai:flex gai:size-3.5 gai:items-center gai:justify-center'>
                {/* <SelectPrimitive.ItemIndicator>
                    <CheckIcon className='gai:size-4' />
                </SelectPrimitive.ItemIndicator> */}
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
    return (
        <SelectPrimitive.Separator
            data-slot='select-separator'
            className={cn('gai:pointer-events-none gai:-mx-1 gai:my-1 gai:h-px gai:bg-border', className)}
            {...props}
        />
    );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
    return (
        <SelectPrimitive.ScrollUpButton
            data-slot='select-scroll-up-button'
            className={cn('gai:flex gai:cursor-default gai:items-center gai:justify-center gai:py-1', className)}
            {...props}
        >
            {/* <ChevronUpIcon className='gai:size-4' /> */}
        </SelectPrimitive.ScrollUpButton>
    );
}

function SelectScrollDownButton({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
    return (
        <SelectPrimitive.ScrollDownButton
            data-slot='select-scroll-down-button'
            className={cn('gai:flex gai:cursor-default gai:items-center gai:justify-center gai:py-1', className)}
            {...props}
        >
            <ChevronDown className='gai:size-4' />
        </SelectPrimitive.ScrollDownButton>
    );
}

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
