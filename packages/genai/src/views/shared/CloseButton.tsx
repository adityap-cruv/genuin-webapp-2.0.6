import Close from '@/assets/SvgIcons/Close';
import { Button } from '@/components/ui/button';

interface CloseButtonProps {
    onClick: () => void;
}

/** Header button that closes a dialog/floater view and cleans up DOM containers. */
export function CloseButton({ onClick }: CloseButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant='ghost'
            size='icon'
            className='gai:flex gai:h-9 gai:w-9 gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-lg gai:border gai:border-primary-100 gai:text-secondary-gray-700 gai:transition-colors gai:hover:text-secondary-gray-900'
            title='Close dialog'
        >
            <Close />
        </Button>
    );
}
