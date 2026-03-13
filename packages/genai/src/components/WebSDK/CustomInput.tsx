import { useEffect, useRef, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
import { stopAgent } from '@/lib/api';
import ArrowUpward from '@/assets/SvgIcons/ArrowUpward';
import Stop from '@/assets/SvgIcons/Stop';
import { Button } from '../ui/button';
import Spinner from '../ui/spinner';
import { getCachedRemoteLottie, loadRemoteLottie } from '@/lib/lottie/load-remote-lottie';

type CustomInputProps = {
    hideBackground?: boolean;
    mode?: 'compact' | 'full';
    suggestedPrompt?: string;
    countdown?: number | null;
    onSuggestedPromptSend?: () => void;
    isLoading?: boolean;
};

const OCTO_IDLE_ANIMATION_PATH = 'sleeping/animations/51914e32-e62c-43d5-b17d-50369bbbf7d6.json';
const OCTO_IDLE_IMAGES_PATH = 'sleeping/';

export function CustomInput({
    hideBackground = false,
    mode = 'full',
    suggestedPrompt,
    countdown = null,
    onSuggestedPromptSend,
    isLoading = false,
}: CustomInputProps) {
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
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [octoLottie, setOctoLottie] = useState<object | null>(() =>
        getCachedRemoteLottie(OCTO_IDLE_ANIMATION_PATH, OCTO_IDLE_IMAGES_PATH)
    );
    const [octoLottieError, setOctoLottieError] = useState(false);

    useEffect(() => {
        setTextAreaRef(textareaRef.current);
    }, [setTextAreaRef]);

    useEffect(() => {
        if (!octoLottie && !octoLottieError) {
            loadRemoteLottie(OCTO_IDLE_ANIMATION_PATH, OCTO_IDLE_IMAGES_PATH)
                .then(data => {
                    setOctoLottie(data);
                })
                .catch(() => {
                    setOctoLottieError(true);
                });
        }
    }, [octoLottie, octoLottieError]);

    // Auto-resize textarea when input changes (for preset prompts, auto-prompt, etc.)
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(Math.max(textareaRef.current.scrollHeight, 32), 120) + 'px';
        }
    }, [input]);

    const currentSession = sessions.find(session => session.id === currentSessionId);
    const hasUserMessages = currentSession?.chat?.some(message => message.role === 'user') ?? false;
    const isCompactMode = mode === 'compact';
    const shouldShowCompactPrompt = isCompactMode && !hasUserMessages;
    const displayPrompt = isLoading ? 'Loading...' : suggestedPrompt || '';
    const showCountdownTimer = countdown !== null && countdown > 0;

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

    const backgroundClass = hideBackground || isCompactMode
        ? 'gai:bg-transparent'
        : enteredInChatMode
            ? 'gai:bg-utility-white'
            : 'gai:bg-primary-50';

    return (
        <div className={backgroundClass}>
            <div className='gai:flex gai:w-full gai:justify-center'>
                <div
                    className='gai:flex gai:w-full gai:max-w-full gai:items-center'
                    style={{
                        width: '100%',
                        maxWidth: '472px',
                        minHeight: '60px',
                        padding: '8px',
                        gap: '8px',
                        background: isCompactMode ? 'transparent' : '#FFFFFF',
                        borderTop: isCompactMode
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid #DFE1E3',
                        boxSizing: 'border-box',
                    }}
                >
                    <div
                        className='gai:flex gai:flex-shrink-0 gai:items-center gai:justify-center'
                        style={{
                            width: '44px',
                            height: '44px',
                            border: isCompactMode
                                ? '1px solid rgba(255, 255, 255, 0.18)'
                                : '1.25px solid #DFE1E3',
                            borderRadius: '30px',
                            background: isCompactMode
                                ? 'rgba(255, 255, 255, 0.12)'
                                : '#F7F9FF',
                            overflow: 'hidden',
                        }}
                    >
                        {octoLottie && !octoLottieError ? (
                            <Player autoplay loop src={octoLottie} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <span className='gai:text-xs gai:font-semibold gai:text-secondary-gray-500'>Octo</span>
                        )}
                    </div>

                    <div
                        className={shouldShowCompactPrompt && showCountdownTimer ? 'gai:flex gai:flex-1 gai:flex-col' : 'gai:flex gai:flex-1 gai:items-center'}
                        style={{
                            flex: '1 1 auto',
                            minWidth: 0,
                            width: '100%',
                            maxWidth: '404px',
                            minHeight: shouldShowCompactPrompt && showCountdownTimer ? '64px' : '44px',
                            padding: shouldShowCompactPrompt && showCountdownTimer ? '12px 16px' : '6px',
                            gap: shouldShowCompactPrompt && showCountdownTimer ? '8px' : '16px',
                            background: '#FFFFFF',
                            alignItems: shouldShowCompactPrompt && showCountdownTimer ? 'stretch' : 'center',
                            borderRadius: '24px',
                            boxSizing: 'border-box',
                        }}
                    >
                        {shouldShowCompactPrompt ? (
                            <>
                                {showCountdownTimer ? (
                                    <>
                                        <div className='gai:flex gai:flex-1 gai:overflow-hidden' style={{ minWidth: 0 }}>
                                            <span className='gai:truncate gai:text-sm gai:font-semibold gai:text-secondary-gray-900'>
                                                {displayPrompt}
                                            </span>
                                        </div>
                                        <div className='gai:flex gai:items-center gai:justify-between'>
                                            <span className='gai:text-xs gai:font-medium gai:text-secondary-gray-500'>
                                                Prompting in...
                                            </span>
                                            <div className='gai:flex gai:h-9 gai:w-9 gai:items-center gai:justify-center gai:rounded-full gai:bg-primary-600'>
                                                <span className='gai:text-sm gai:font-semibold gai:text-white'>{countdown}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-1 gai:overflow-hidden' style={{ minWidth: 0 }}>
                                            <span className='gai:text-[10px] gai:font-medium gai:uppercase gai:tracking-wide gai:text-secondary-gray-500'>
                                                Suggested
                                            </span>
                                            <span className='gai:truncate gai:text-sm gai:font-semibold gai:text-secondary-gray-900'>
                                                {displayPrompt}
                                            </span>
                                        </div>
                                        <Button
                                            disabled={creatingSession || isLoading || !displayPrompt || !onSuggestedPromptSend}
                                            size={'icon'}
                                            onClick={() => {
                                                if (onSuggestedPromptSend) {
                                                    onSuggestedPromptSend();
                                                }
                                            }}
                                            className='gai:cursor-pointer gai:flex-shrink-0 gai:rounded-full'
                                            style={{ width: '36px', height: '36px' }}
                                        >
                                            {creatingSession ? (
                                                <Spinner size='sm' color='secondary' />
                                            ) : (
                                                <ArrowUpward />
                                            )}
                                        </Button>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    className='gai:flex-1 gai:max-h-[120px] gai:resize-none gai:overflow-y-auto gai:border-0 gai:bg-transparent gai:text-secondary-gray-900 gai:outline-0 gai:placeholder:text-secondary-gray-600'
                                    style={{
                                        minWidth: 0,
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        lineHeight: '32px',
                                        minHeight: '32px',
                                        height: '100%',
                                        padding: '0',
                                    }}
                                    placeholder='Type your message here...'
                                    onInput={e => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = '32px';
                                        target.style.height = Math.min(Math.max(target.scrollHeight, 32), 120) + 'px';
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

                                <Button
                                    disabled={
                                        creatingSession || stopping
                                            ? true
                                            : !input && !currentSession?.thinking
                                                ? true
                                                : false
                                    }
                                    size={'icon'}
                                    onClick={handleOnClick}
                                    className='gai:cursor-pointer gai:flex-shrink-0 gai:rounded-full'
                                    style={{ width: '36px', height: '36px' }}
                                >
                                    {creatingSession ? (
                                        <Spinner size='sm' color='secondary' />
                                    ) : (
                                        <>{currentSession?.thinking ? <Stop /> : <ArrowUpward />}</>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
