import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "gai:inline-flex gai:items-center gai:justify-center gai:gap-2 gai:whitespace-nowrap gai:rounded-md gai:transition-all gai:disabled:pointer-events-none gai:disabled:opacity-50 [&_svg]:gai:pointer-events-none [&_svg:not([class*='gai:size-'])]:gai:size-4 gai:shrink-0 [&_svg]:gai:shrink-0 gai:outline-none gai:focus-visible:border-ring gai:focus-visible:ring-ring/50 gai:focus-visible:ring-[3px] gai:aria-invalid:ring-destructive/20 gai:dark:aria-invalid:ring-destructive/40 gai:aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                preset: 'gai:cursor-pointer gai:rounded-full gai:border gai:border-primary-100 gai:bg-utility-white  gai:shadow-none gai:hover:bg-primary-50',
                objective:
                    'gai:cursor-pointer gai:rounded-full gai:border gai:border-primary-100 gai:bg-utility-white gai:font-body-2-med gai:md:font-body-1-med gai:text-secondary-gray-700 gai:shadow-none gai:hover:bg-primary-100 gai:hover:text-secondary-gray-900',
                tools: 'gai:cursor-pointer gai:rounded-full gai:border gai:border-primary-100 gai:bg-utility-white gai:font-body-1-med gai:text-secondary-gray-700 gai:shadow-none gai:hover:bg-primary-50',
                tools_active:
                    'gai:cursor-pointer gai:rounded-full gai:border gai:border-primary-100 gai:bg-utility-white gai:font-body-1-med gai:text-secondary-gray-700 gai:shadow-none gai:hover:bg-primary-50 gai:bg-primary-50 gai:text-secondary-gray-900',
                default: 'gai:bg-primary gai:text-primary-foreground gai:shadow-xs gai:hover:bg-primary-700',
                destructive:
                    'gai:bg-destructive gai:text-white gai:shadow-xs gai:hover:bg-destructive/90 gai:focus-visible:ring-destructive/20 gai:dark:focus-visible:ring-destructive/40 gai:dark:bg-destructive/60',
                outline:
                    'gai:border gai:bg-background gai:shadow-xs gai:hover:bg-accent gai:hover:text-accent-foreground gai:dark:bg-input/30 gai:dark:border-input gai:dark:hover:bg-input/50',
                secondary: 'gai:bg-secondary gai:text-secondary-foreground gai:shadow-xs gai:hover:bg-secondary/80',
                ghost: '',
                link: 'gai:text-primary gai:underline-offset-4 gai:hover:underline',
            },
            size: {
                default: 'gai:h-9 gai:px-4 gai:py-2 gai:has-[>svg]:pl-2 gai:has-[>svg]:pr-3',
                sm: 'gai:h-8 gai:rounded-md gai:gap-1.5 gai:px-3 gai:has-[>svg]:px-2.5',
                lg: 'gai:h-10 gai:rounded-md gai:px-6 gai:has-[>svg]:px-4',
                icon: 'gai:size-9',
                feedback: 'gai:size-7',
                tools: 'gai:h-9 gai:px-4 gai:py-2',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return <Comp data-slot='button' className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
