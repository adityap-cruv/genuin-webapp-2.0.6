import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { getPreSignedUrl } from '@/services/api';
import { useUIContext } from '@/stores/ui/context';
import type { UploadedFile } from '@/types';

import { ALLOWED_TYPES, MAX_FILE_SIZE } from '../utils/fileUtils';

const uploadFileToPreSignedUrl = async (file: File, preSignedUrl: string): Promise<void> => {
    const response = await fetch(preSignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type,
        },
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }
};

export const useFileUpload = () => {
    const { brand_id, user_id, setS3Keys, clearS3Keys } = useUIContext();
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const uploadFilesToS3 = async (filesToUpload: UploadedFile[]): Promise<boolean> => {
        if (filesToUpload.length === 0) {
            return true;
        }

        setIsUploadingFiles(true);

        try {
            const uploadedS3Keys: string[] = [];

            for (const uploadedFile of filesToUpload) {
                try {
                    setUploadedFiles(prev =>
                        prev.map(f => (f.id === uploadedFile.id ? { ...f, uploadStatus: 'uploading' } : f))
                    );

                    const { data } = await getPreSignedUrl({
                        file_name: uploadedFile.file.name,
                        brand_id: brand_id,
                        user_id: user_id,
                    });

                    await uploadFileToPreSignedUrl(uploadedFile.file, data.url);

                    uploadedS3Keys.push(data.s3_key);

                    setUploadedFiles(prev =>
                        prev.map(f =>
                            f.id === uploadedFile.id ? { ...f, s3Key: data.s3_key, uploadStatus: 'success' } : f
                        )
                    );
                } catch (_error) {
                    setUploadedFiles(prev =>
                        prev.map(f => (f.id === uploadedFile.id ? { ...f, uploadStatus: 'error' } : f))
                    );
                }
            }

            // Update S3 keys in context - combine newly uploaded keys with existing ones
            // Get existing S3 keys from files that were already uploaded before this batch
            const existingS3Keys = uploadedFiles
                .filter(f => f.s3Key && f.uploadStatus === 'success' && !filesToUpload.find(uf => uf.id === f.id))
                .map(f => f.s3Key!);
            // Combine with newly uploaded keys
            const allS3Keys = [...existingS3Keys, ...uploadedS3Keys];
            clearS3Keys();
            if (allS3Keys.length > 0) {
                setS3Keys(allS3Keys);
            }

            return true;
        } catch (_error) {
            toast.error('Failed to upload some files. Please try again.');
            return false;
        } finally {
            setIsUploadingFiles(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles: UploadedFile[] = [];

        for (const file of files) {
            if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
                toast.error(`File type ${file.type} is not allowed. Please upload PDF, TXT, CSV, or image files.`);
                continue;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
                continue;
            }

            const uploadedFile: UploadedFile = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadStatus: 'uploading',
            };

            validFiles.push(uploadedFile);
        }

        if (validFiles.length === 0) {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Add files to state first (for immediate UI feedback)
        for (const uploadedFile of validFiles) {
            if (uploadedFile.file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = e => {
                    uploadedFile.preview = e.target?.result as string;
                    setUploadedFiles(prev => [...prev, uploadedFile]);
                };
                reader.readAsDataURL(uploadedFile.file);
            } else {
                setUploadedFiles(prev => [...prev, uploadedFile]);
            }
        }

        // Now upload to S3 using pre-signed URLs
        await uploadFilesToS3(validFiles);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (fileId: string) => {
        setUploadedFiles(prev => {
            const remaining = prev.filter(file => file.id !== fileId);
            // Update S3 keys to reflect remaining files
            const remainingS3Keys = remaining.filter(f => f.s3Key && f.uploadStatus === 'success').map(f => f.s3Key!);
            clearS3Keys();
            if (remainingS3Keys.length > 0) {
                setS3Keys(remainingS3Keys);
            }
            return remaining;
        });
    };

    const clearFiles = () => {
        setUploadedFiles([]);
        clearS3Keys();
    };

    return {
        uploadedFiles,
        isUploadingFiles,
        fileInputRef,
        triggerFileUpload,
        handleFileSelect,
        handleRemoveFile,
        clearFiles,
    };
};
