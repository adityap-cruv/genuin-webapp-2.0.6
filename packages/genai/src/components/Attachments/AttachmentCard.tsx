import type { ReactNode } from 'react';

import Document from '@/assets/SvgIcons/Document';
import Pdf from '@/assets/SvgIcons/Pdf';
import Table from '@/assets/SvgIcons/Table';
import Video from '@/assets/SvgIcons/Video';

import { getFileIcon, getFileTypeLabel, getUploadStatusIcon } from '../MessageInput/utils/fileUtils';
import Spinner from '../ui/spinner';

const getBadgeStyles = (type?: string) => {
    if (!type) {
        return { bg: 'gai:bg-secondary-gray-200', iconColor: 'gai:text-secondary-gray-700' };
    }

    if (type.includes('pdf')) return { bg: 'gai:bg-red-100', iconColor: 'gai:text-red-600' };
    if (type.includes('image')) return { bg: 'gai:bg-amber-50', iconColor: 'gai:text-amber-600' };
    if (type.includes('text')) return { bg: 'gai:bg-green-100', iconColor: 'gai:text-green-600' };
    if (type.includes('csv')) return { bg: 'gai:bg-blue-100', iconColor: 'gai:text-blue-600' };

    return { bg: 'gai:bg-primary-50', iconColor: 'gai:text-primary-600' };
};

interface AttachmentCardProps {
    name?: string;
    type?: string;
    previewUrl?: string;
    status?: 'uploading' | 'success' | 'error';
    className?: string;
    actions?: ReactNode;
}

const AttachmentCard = ({ name, type, previewUrl, status, className, actions }: AttachmentCardProps) => {
    const showImagePreview = Boolean(previewUrl);
    const { bg, iconColor } = getBadgeStyles(type);
    const iconKind = getFileIcon(type || '');
    const icon =
        iconKind === 'pdf' ? (
            <Pdf className='gai:h-5 gai:w-5' />
        ) : iconKind === 'table' ? (
            <Table className='gai:h-5 gai:w-5' />
        ) : iconKind === 'video' ? (
            <Video className='gai:h-5 gai:w-5' />
        ) : (
            <Document className='gai:h-5 gai:w-5' />
        );
    const typeLabel = type || getFileTypeLabel(type || '');

    const widthClasses = showImagePreview ? 'gai:flex-initial gai:w-auto' : 'gai:max-w-[280px] gai:flex-1';

    return (
        <div
            className={`gai:relative gai:flex gai:items-center gai:gap-3 gai:rounded-2xl gai:border gai:border-primary-100 gai:bg-white ${
                showImagePreview ? 'gai:p-0' : 'gai:p-1 gai:pe-3'
            } ${widthClasses} ${className || ''}`}
        >
            {showImagePreview ? (
                <div className='gai:relative gai:h-16 gai:w-16 gai:overflow-hidden gai:rounded-xl'>
                    <img
                        src={previewUrl}
                        alt={name}
                        className='gai:h-full gai:w-full gai:object-contain gai:rounded-2xl'
                        loading='lazy'
                    />
                    {status && status !== 'success' && (
                        <div className='gai:absolute gai:inset-0 gai:flex gai:items-center gai:justify-center gai:bg-black/40'>
                            {status === 'uploading' ? (
                                <Spinner size='sm' color='secondary' />
                            ) : (
                                getUploadStatusIcon(status)
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className='gai:relative gai:flex gai:h-14 gai:w-14 gai:items-center gai:justify-center gai:rounded-xl'>
                    <div className={`${bg} gai:absolute gai:inset-0 gai:rounded-xl`}></div>
                    <span className={`gai:relative gai:text-2xl ${iconColor}`}>{icon}</span>
                    {status && status !== 'success' && (
                        <div className='gai:absolute gai:inset-0 gai:flex gai:items-center gai:justify-center gai:rounded-xl gai:bg-black/30'>
                            {status === 'uploading' ? (
                                <Spinner size='sm' color='secondary' />
                            ) : (
                                getUploadStatusIcon(status)
                            )}
                        </div>
                    )}
                </div>
            )}

            {!showImagePreview && (
                <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-1'>
                    <span
                        className='gai:text-sm gai:font-semibold gai:text-secondary-gray-900 gai:line-clamp-2 gai:max-w-[180px] gai:truncate'
                        title={name || 'Untitled file'}
                    >
                        {name || 'Untitled file'}
                    </span>
                    <span className='gai:text-xs gai:text-secondary-gray-600'>{typeLabel}</span>
                </div>
            )}

            {actions && <div className='gai:absolute gai:right-1 gai:top-1'>{actions}</div>}
        </div>
    );
};

export default AttachmentCard;

