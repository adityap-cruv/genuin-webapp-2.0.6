import { useEffect, useRef, useState } from 'react';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import { stopAgent } from '@/lib/api';
import ArrowUpward from '@/assets/SvgIcons/ArrowUpward';
import Stop from '@/assets/SvgIcons/Stop';
import Add from '@/assets/SvgIcons/Add';
import { Button } from '../ui/button';
import Spinner from '../ui/spinner';
import { useFileUpload } from '../MessageInput/hooks/useFileUpload';
import { UploadedFilesList } from '../MessageInput/UploadedFilesList';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type CustomInputProps = {
    hideBackground?: boolean;
};

export function CustomInput({ hideBackground = false }: CustomInputProps) {
    const {
        creatingSession,
        currentSessionId,
        sessions,
        handleSendMessage,
        user_id,
        setTextAreaRef,
        enteredInChatMode,
    } = useAgentsContext();
    const { input, setInput } = useInputContext();
    const [stopping, setStopping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const {
        uploadedFiles,
        isUploadingFiles,
        fileInputRef,
        triggerFileUpload,
        handleFileSelect,
        handleRemoveFile,
        clearFiles,
    } = useFileUpload();

    useEffect(() => {
        setTextAreaRef(textareaRef.current);
    }, [setTextAreaRef]);

    // Auto-resize textarea when input changes (for preset prompts, auto-prompt, etc.)
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const currentSession = sessions.find(session => session.id === currentSessionId);

    const handleOnClick = async () => {
        if (currentSession?.thinking) {
            setStopping(true);
            await stopAgent({
                session_id: currentSessionId || '',
                user_id: user_id,
            });
            setStopping(false);
        } else {
            await handleSendMessage({
                targetSessionId: currentSessionId,
                messageInput: input,
                onMessageQueued: () => {
                    setInput('');
                    clearFiles();
                },
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!creatingSession && (input || currentSession?.thinking)) {
                handleOnClick();
            }
        }

        // Prevent arrow keys from propagating to parent player-swiper
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.stopPropagation();
        }
    };

    const backgroundClass = hideBackground
        ? 'gai:bg-transparent'
        : enteredInChatMode
            ? 'gai:bg-utility-white'
            : 'gai:bg-primary-50';

    return (
        <div className={backgroundClass}>
            <div
                className='gai:flex gai:flex-col gai:items-start gai:justify-center gai:self-stretch gai:rounded-[24px] gai:p-[1px]'
                style={{
                    boxShadow: '0px 4px 20px 0px #3F3F3F1A',
                    background: isFocused ? '#B8BCFF' : '#E8ECFF',
                }}
            >
                <div className='gai:relative gai:w-full gai:rounded-[23px] gai:bg-utility-white'>
                    {/* Uploaded files list */}
                    {uploadedFiles.length > 0 && (
                        <div style={{ paddingTop: '8px', paddingRight: '8px', paddingLeft: '8px' }}>
                            <UploadedFilesList files={uploadedFiles} onRemove={handleRemoveFile} />
                        </div>
                    )}

                    {/* Input row with Add button (left) + textarea (center) + Send button (right) */}
                    <div
                        className='gai:flex gai:items-center gai:gap-2 gai:self-stretch'
                        style={{ padding: '8px' }}
                    >
                        {/* Add/Upload button with popover - left side */}
                        <Popover open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    size={'icon'}
                                    variant={'tools'}
                                    className='gai:flex-shrink-0'
                                    style={{ width: 24, height: 24 }}
                                >
                                    <Add className='gai:size-4' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className='gai:w-50 gai:rounded-2xl gai:border gai:border-primary-100 gai:p-2 gai:shadow-lg'
                                side='top'
                                align='start'
                            >
                                <div className='gai:space-y-2'>
                                    <div className='gai:flex gai:flex-col gai:gap-1'>
                                        <Button
                                            variant={'ghost'}
                                            className='gai:cursor-pointer gai:justify-start gai:font-body-1-semi gai:hover:bg-primary-50'
                                            onClick={() => {
                                                triggerFileUpload();
                                                setIsAddPopoverOpen(false);
                                            }}
                                            disabled={isUploadingFiles}
                                        >
                                            Upload files
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Textarea - center, takes remaining space */}
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            className='gai:max-h-[120px] gai:flex-1 gai:resize-none gai:overflow-y-auto gai:border-0 gai:text-secondary-gray-900 gai:outline-0 gai:placeholder:text-secondary-gray-600'
                            style={{
                                fontSize: '16px',
                                fontWeight: '500',
                                lineHeight: '20px',
                                letterSpacing: '0px',
                                transform: 'scale(0.875)',
                                transformOrigin: 'left',
                                width: '114.29%',
                                paddingLeft: '8px',
                            }}
                            placeholder='Type your message here...'
                            onInput={e => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                            onFocus={() => {
                                setIsFocused(true);
                            }}
                            onBlur={() => {
                                setIsFocused(false);
                            }}
                            value={input}
                            onChange={e => {
                                setInput(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                        />

                        {/* Send button - right side */}
                        <Button
                            disabled={
                                creatingSession || stopping || isUploadingFiles
                                    ? true
                                    : !input && !currentSession?.thinking
                                      ? true
                                      : false
                            }
                            size={'icon'}
                            onClick={handleOnClick}
                            className='gai:cursor-pointer gai:rounded-full gai:flex-shrink-0'
                        >
                            {creatingSession ? (
                                <Spinner size='sm' color='secondary' />
                            ) : (
                                <>{currentSession?.thinking ? <Stop /> : <ArrowUpward />}</>
                            )}
                        </Button>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type='file'
                        multiple
                        accept='.pdf,.txt,.csv,.jpg,.jpeg,.png,.webp'
                        className='gai:hidden'
                        onChange={handleFileSelect}
                    />
                </div>
            </div>

        </div>
    );
}
