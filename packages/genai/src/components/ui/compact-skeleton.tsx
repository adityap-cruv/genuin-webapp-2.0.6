import { cn } from '@/lib/utils';

interface CompactSkeletonProps extends React.ComponentProps<'div'> {
    width?: number | string;
}

export function CompactSkeleton({ className, width = '60%', ...props }: CompactSkeletonProps) {
    return (
        <div
            data-slot='compact-skeleton'
            className={cn(
                'gai:animate-pulse gai:border gai:border-white/30 gai:bg-white/35 gai:shadow-[inset_0_0_8px_rgba(255,255,255,0.25)]',
                className
            )}
            style={{ height: '0.75rem', width, borderRadius: '9999px', ...props.style }}
            {...props}
        />
    );
}
