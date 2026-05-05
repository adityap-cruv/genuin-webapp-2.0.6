import Close from '@/assets/SvgIcons/Close';
import type { UploadedFile } from '@/types';

import AttachmentCard from '../Attachments/AttachmentCard';
import { Button } from '../ui/button';

interface UploadedFilesListProps {
    files: UploadedFile[];
    onRemove: (fileId: string) => void;
}

export const UploadedFilesList = ({ files, onRemove }: UploadedFilesListProps) => {
    if (files.length === 0) {
        return null;
    }

    return (
        <div className='gai:flex gai:w-full gai:overflow-auto gai:gap-3 gai:pb-2'>
            {files.map(file => (
                <AttachmentCard
                    key={file.id}
                    name={file.name}
                    type={file.type}
                    previewUrl={file.preview as string | undefined}
                    status={file.uploadStatus}
                    actions={
                        <Button
                            size='icon'
                            variant='ghost'
                            className='gai:h-5 gai:w-5 gai:rounded-full gai:bg-secondary-gray-900 gai:p-0 gai:text-white gai:hover:bg-secondary-gray-700'
                            onClick={() => onRemove(file.id)}
                        >
                            <Close className='gai:size-3' />
                        </Button>
                    }
                />
            ))}
        </div>
    );
};

