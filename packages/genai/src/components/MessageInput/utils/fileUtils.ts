export type FileIconKind = 'pdf' | 'table' | 'document' | 'video';

export const getFileIcon = (type: string): FileIconKind => {
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('csv')) return 'table';
    if (type.includes('video')) return 'video';
    return 'document';
};

export const getUploadStatusIcon = (status?: string): string => {
    switch (status) {
        case 'uploading':
            return '⏳';
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        default:
            return '';
    }
};

export const getFileTypeLabel = (type: string): string => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('text')) return 'TXT';
    return 'FILE';
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_TYPES = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/webp': '.webp',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'video/mp4': '.mp4',
} as const;
