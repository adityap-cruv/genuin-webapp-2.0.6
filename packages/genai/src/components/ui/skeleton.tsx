import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot='skeleton'
            className={cn('gai:animate-pulse gai:rounded-md gai:bg-secondary-gray-200', className)}
            {...props}
        />
    );
}

export { Skeleton };
