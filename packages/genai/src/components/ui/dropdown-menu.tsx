import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
// import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
    return <DropdownMenuPrimitive.Root data-slot='dropdown-menu' {...props} />;
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
    return <DropdownMenuPrimitive.Portal data-slot='dropdown-menu-portal' {...props} />;
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
    return <DropdownMenuPrimitive.Trigger data-slot='dropdown-menu-trigger' {...props} />;
}

function DropdownMenuContent({
    className,
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
    return (
        <DropdownMenuPrimitive.Portal container={document.querySelector('.genai-sdk-container')}>
            <DropdownMenuPrimitive.Content
                data-slot='dropdown-menu-content'
                sideOffset={sideOffset}
                className={cn(
                    'genai-sdk-container gai:font-inter',
                    'gai:max-h-(--radix-dropdown-menu-content-available-height) gai:min-w-[8rem] gai:origin-(--radix-dropdown-menu-content-transform-origin) gai:overflow-x-hidden gai:overflow-y-auto gai:rounded-md gai:border gai:bg-popover gai:p-1 gai:text-popover-foreground gai:shadow-md',
                    'gai:relative gai:isolate gai:z-[9999]',
                    className
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
    return <DropdownMenuPrimitive.Group data-slot='dropdown-menu-group' {...props} />;
}

function DropdownMenuItem({
    className,
    inset,
    variant = 'default',
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
}) {
    return (
        <DropdownMenuPrimitive.Item
            data-slot='dropdown-menu-item'
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "gai:relative gai:flex gai:cursor-default gai:items-center gai:gap-2 gai:rounded-sm gai:px-2 gai:py-1.5 gai:outline-hidden gai:select-none gai:data-[disabled]:pointer-events-none gai:data-[disabled]:opacity-50 gai:data-[inset]:pl-8 gai:data-[variant=destructive]:text-destructive gai:[&_svg]:pointer-events-none gai:[&_svg]:shrink-0 gai:[&_svg:not([class*='size-'])]:size-4 gai:[&_svg:not([class*='text-'])]:text-muted-foreground gai:data-[variant=destructive]:*:[svg]:!text-destructive",
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuCheckboxItem({
    className,
    children,
    checked,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            data-slot='dropdown-menu-checkbox-item'
            className={cn(
                "gai:relative gai:flex gai:cursor-default gai:items-center gai:gap-2 gai:rounded-sm gai:py-1.5 gai:pr-2 gai:pl-8 gai:text-sm gai:outline-hidden gai:select-none gai:data-[disabled]:pointer-events-none gai:data-[disabled]:opacity-50 gai:[&_svg]:pointer-events-none gai:[&_svg]:shrink-0 gai:[&_svg:not([class*='size-'])]:size-4",
                className
            )}
            checked={checked}
            {...props}
        >
            <span className='pointer-events-none absolute left-2 flex size-3.5 items-center justify-center'>
                {/* <DropdownMenuPrimitive.ItemIndicator>
                    <CheckIcon className='size-4' />
                </DropdownMenuPrimitive.ItemIndicator> */}
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    );
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
    return <DropdownMenuPrimitive.RadioGroup data-slot='dropdown-menu-radio-group' {...props} />;
}

function DropdownMenuRadioItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
    return (
        <DropdownMenuPrimitive.RadioItem
            data-slot='dropdown-menu-radio-item'
            className={cn(
                "gai:relative gai:flex gai:cursor-default gai:items-center gai:gap-2 gai:rounded-sm gai:py-1.5 gai:pr-2 gai:pl-8 gai:text-sm gai:outline-hidden gai:select-none gai:data-[disabled]:pointer-events-none gai:data-[disabled]:opacity-50 gai:[&_svg]:pointer-events-none gai:[&_svg]:shrink-0 gai:[&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        >
            <span className='pointer-events-none absolute left-2 flex size-3.5 items-center justify-center'>
                {/* <DropdownMenuPrimitive.ItemIndicator>
                    <CircleIcon className='size-2 fill-current' />
                </DropdownMenuPrimitive.ItemIndicator> */}
            </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    );
}

function DropdownMenuLabel({
    className,
    inset,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
}) {
    return (
        <DropdownMenuPrimitive.Label
            data-slot='dropdown-menu-label'
            data-inset={inset}
            className={cn('gai:px-2 gai:py-1.5 gai:data-[inset]:pl-8', className)}
            {...props}
        />
    );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
    return (
        <DropdownMenuPrimitive.Separator
            data-slot='dropdown-menu-separator'
            className={cn('gai:-mx-1 gai:my-1 gai:h-px gai:bg-border', className)}
            {...props}
        />
    );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot='dropdown-menu-shortcut'
            className={cn('gai:ml-auto gai:tracking-widest gai:text-muted-foreground', className)}
            {...props}
        />
    );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
    return <DropdownMenuPrimitive.Sub data-slot='dropdown-menu-sub' {...props} />;
}

function DropdownMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
}) {
    return (
        <DropdownMenuPrimitive.SubTrigger
            data-slot='dropdown-menu-sub-trigger'
            data-inset={inset}
            className={cn(
                'gai:flex gai:cursor-default gai:items-center gai:rounded-sm gai:px-2 gai:py-1.5 gai:outline-hidden gai:select-none gai:data-[inset]:pl-8',
                className
            )}
            {...props}
        >
            {children}
            {/* <ChevronRightIcon className='ml-auto size-4' /> */}
        </DropdownMenuPrimitive.SubTrigger>
    );
}

function DropdownMenuSubContent({
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
    return (
        <DropdownMenuPrimitive.Portal container={document.querySelector('.genai-sdk-container')}>
            <DropdownMenuPrimitive.SubContent
                data-slot='dropdown-menu-sub-content'
                className={cn(
                    'gai:z-[9999] gai:min-w-[8rem] gai:origin-(--radix-dropdown-menu-content-transform-origin) gai:overflow-hidden gai:rounded-md gai:border gai:bg-popover gai:p-1 gai:text-popover-foreground gai:shadow-lg',
                    className
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

export {
    DropdownMenu,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
};
