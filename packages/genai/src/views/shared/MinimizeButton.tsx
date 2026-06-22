import ArrowCornerLeft from '@/assets/SvgIcons/ArrowCornerLeft';
import { Button } from '@/components/ui/button';

interface MinimizeButtonProps {
    onClick: () => void;
}

/** Header button that minimizes a dialog/floater view back to the floater button. */
export function MinimizeButton({ onClick }: MinimizeButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant='ghost'
            size='icon'
            className='gai:h-9 gai:w-9 gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-lg gai:border gai:border-primary-100 gai:text-secondary-gray-700 gai:transition-colors gai:hover:bg-none gai:hover:text-secondary-gray-900'
            title='Minimize dialog'
        >
            <ArrowCornerLeft />
        </Button>
    );
}
