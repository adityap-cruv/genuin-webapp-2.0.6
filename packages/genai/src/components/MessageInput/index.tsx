import Stop from '@/assets/SvgIcons/Stop';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import { stopAgent } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import ArrowUpward from '../../assets/SvgIcons/ArrowUpward';
import { Button } from '../ui/button';
import Spinner from '../ui/spinner';
import { useFileUpload } from './hooks/useFileUpload';
import { LeftButtons } from './LeftButtons';
import PresetPrompts from './PresetPrompts';
import { UploadedFilesList } from './UploadedFilesList';

const MessageInput = () => {
    const {
        creatingSession,
        currentSessionId,
        sessions,
        handleSendMessage,
        user_id,
        // isSuggestionsOpen,
        setIsSuggestionsOpen,
        setTextAreaRef,
        suggestedPrompts,
    } = useAgentsContext();
    const { input, setInput } = useInputContext();
    const [stopping, setStopping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isStylesOpen, setIsStylesOpen] = useState(false);
    const [showPresetPrompts, setShowPresetPrompts] = useState(true);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const {
        uploadedFiles,
        isUploadingFiles,
        fileInputRef,
        triggerFileUpload,
        handleFileSelect,
        handleRemoveFile,
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

    // Show preset prompts when new suggestions arrive
    useEffect(() => {
        if (suggestedPrompts.length > 0) {
            setShowPresetPrompts(true);
        }
    }, [suggestedPrompts]);

    // const brands = ['Ted', 'iHeart', 'Walmart'];
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
                    // Clear input only after message is successfully queued (after session creation if needed)
                    setInput('');
                }
            });
            // Clear uploaded files after sending
            // handleSendMessage(currentSessionId, input, "brand_asset_agent");
            // handleSendMessage(currentSessionId, input, 'social_handle_fetcher_agent');
        }
    };

    return (
        <div
            className={`gai:box-shadow gai:flex gai:flex-col gai:items-start gai:justify-center gai:self-stretch gai:rounded-[24px] gai:bg-utility-white gai:bg-gradient-to-r gai:from-[#9395FF] gai:to-[#1685FD] gai:p-0 ${isFocused ? 'gai:p-[1px]' : 'gai:border gai:border-primary-100'}`}
        >
            <div className='gai:box-shadow gai:relative gai:w-full gai:rounded-[23px] gai:bg-utility-white'>
                {/* Suggestions Dropdown */}
                {/* {isSuggestionsOpen && <PromptSuggestions brands={brands} setIsSuggestionsOpen={setIsSuggestionsOpen} />} */}
                {/* preset prompts - show when no session or when response is completed (not thinking) */}
                {showPresetPrompts && (!currentSessionId || (currentSession && !currentSession.thinking)) && (
                    <PresetPrompts
                        setIsSuggestionsOpen={setIsSuggestionsOpen}
                        onClose={() => setShowPresetPrompts(false)}
                    />
                )}
                {/* input textarea */}
                <div className='gai:flex gai:flex-col gai:items-start gai:gap-2 gai:self-stretch gai:px-5 gai:py-6'>
                    <UploadedFilesList files={uploadedFiles} onRemove={handleRemoveFile} />
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        className='gai:max-h-[120px] gai:w-full gai:resize-none gai:overflow-y-auto gai:border-0 gai:text-secondary-gray-900 gai:outline-0 gai:placeholder:text-secondary-gray-600'
                        style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            lineHeight: '20px',
                            letterSpacing: '0px',
                            transform: 'scale(0.875)',
                            transformOrigin: 'left',
                            width: '114.29%',
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
                            if (input.length > e.target.value.length) setIsSuggestionsOpen(false);
                            setInput(e.target.value);
                        }}
                        onKeyDown={e => {
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
                        }}
                    />
                </div>
                {/* buttons */}
                <div className='gai:flex gai:items-start gai:justify-between gai:self-stretch gai:px-1 gai:pt-0 gai:pb-1 gai:md:px-3 gai:md:pb-3'>
                    <LeftButtons
                        isStylesOpen={isStylesOpen}
                        setIsStylesOpen={setIsStylesOpen}
                        onUploadClick={triggerFileUpload}
                        isUploadingFiles={isUploadingFiles}
                    />

                    {/* right button */}
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
                        className='gai:cursor-pointer gai:rounded-full'
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
    );
};

export default MessageInput;
