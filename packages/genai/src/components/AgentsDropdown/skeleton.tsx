import { Skeleton } from '@/components/ui/skeleton';

const AgentsDropdownSkeleton = () => {
    return (
        <div className='gai:box-shadow gai:flex gai:items-center gai:gap-1 gai:rounded-full gai:border gai:border-primary-100 gai:bg-utility-white gai:p-1 gai:pr-2 gai:outline-none'>
            <div className='gai:flex gai:items-center gai:gap-2'>
                <div className='gai:flex gai:h-8 gai:w-8 gai:items-center gai:justify-center'>
                    <Skeleton className='gai:h-full gai:w-full gai:rounded-full' />
                </div>
                <Skeleton className='gai:h-5 gai:w-16' />
            </div>
        </div>
    );
};

export default AgentsDropdownSkeleton;
