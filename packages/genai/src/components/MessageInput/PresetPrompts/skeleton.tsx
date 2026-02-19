import { Skeleton } from '@/components/ui/skeleton';

const PresetPromptsSkeleton = () => {
    // Create 3 skeleton items to show while loading
    const skeletonItems = Array.from({ length: 3 }, (_, index) => index);

    return (
        <>
            {skeletonItems.map(index => (
                <div
                    key={index}
                    className='gai:border-b gai:border-b-secondary-gray-150 gai:px-4 gai:py-3 gai:last:border-b-0 gai:first:rounded-t-xl gai:last:rounded-b-xl'
                >
                    <Skeleton className='gai:h-5 gai:w-full gai:rounded' />
                </div>
            ))}
        </>
    );
};

export default PresetPromptsSkeleton;
