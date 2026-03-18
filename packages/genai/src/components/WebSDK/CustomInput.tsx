import { useCallback, useEffect, useRef, useState } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useAgentsContext } from '@/context/app/context';
import { useInputContext } from '@/context/input/context';
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
    onActivate?: () => void;
};

const OCTO_IDLE_ANIMATION_PATH = 'updating/animations/57d84bf1-8b2c-481d-b47f-69cd84633961.json';
const OCTO_IDLE_IMAGES_PATH = 'updating/';

export function CustomInput({
    hideBackground = false,
    mode = 'full',
    suggestedPrompt,
    countdown = null,
    onSuggestedPromptSend,
    isLoading = false,
    onActivate,
}: CustomInputProps) {
    const {
        creatingSession,
        currentSessionId,
        sessions,
        handleSendMessage,
        setTextAreaRef,
        enteredInChatMode,
        stopSessionResponse,
    } = useAgentsContext();
    const { input, setInput } = useInputContext();
    const [stopping, setStopping] = useState(false);
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

    const handleActivate = useCallback(() => {
        if (isCompactMode) {
            onActivate?.();
        }
    }, [isCompactMode, onActivate]);

    const handleOnClick = async () => {
        handleActivate();
        if (currentSession?.thinking) {
            setStopping(true);
            try {
                await stopSessionResponse(currentSessionId);
            } finally {
                setStopping(false);
            }
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

    const rootClassName = [backgroundClass, isCompactMode ? 'gai:pt-0' : '']
        .filter(Boolean)
        .join(' ');
    const wrapperClassName = ['gai:flex gai:w-full gai:justify-center', isCompactMode ? 'gai:mt-0' : '']
        .filter(Boolean)
        .join(' ');
    const inputShellClassName = [
        'gai:flex gai:w-full gai:max-w-full gai:items-center gai:box-border gai:p-2 gai:gap-2 gai:min-h-[60px]',
        'gai:max-w-[472px]',
        isCompactMode ? 'gai:bg-transparent gai:cursor-pointer' : 'gai:bg-white gai:border-t gai:border-[#DFE1E3]',
    ]
        .filter(Boolean)
        .join(' ');
    const avatarContainerClassName = [
        'gai:flex gai:flex-shrink-0 gai:items-center gai:justify-center gai:h-11 gai:w-11 gai:rounded-[30px] gai:overflow-hidden',
        isCompactMode
            ? 'gai:border gai:border-[rgba(255,255,255,0.18)] gai:bg-[rgba(255,255,255,0.12)] gai:cursor-pointer'
            : 'gai:border-[1.25px] gai:border-[#DFE1E3] gai:bg-[#F7F9FF]',
    ]
        .filter(Boolean)
        .join(' ');
    const showCountdownPrompt = shouldShowCompactPrompt && showCountdownTimer;
    const inputContainerClassName = [
        'gai:flex gai:flex-1 gai:min-w-0 gai:w-full gai:max-w-[404px] gai:rounded-[24px] gai:box-border',
        isCompactMode ? 'gai:bg-white' : 'gai:bg-[#EFF3FF]',
        showCountdownPrompt
            ? 'gai:flex-col gai:items-stretch gai:gap-2 gai:px-4 gai:py-3 gai:min-h-[64px]'
            : 'gai:items-center gai:gap-4 gai:p-1.5 gai:min-h-[44px]',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={rootClassName}>
            <div className={wrapperClassName}>
                <div className={inputShellClassName} onClick={handleActivate}>
                    <div className={avatarContainerClassName} onClick={handleActivate}>
                        {octoLottie && !octoLottieError ? (
                            <Player autoplay loop src={octoLottie} className='gai:h-full gai:w-full' />
                        ) : (
                            <span className='gai:text-xs gai:font-semibold gai:text-secondary-gray-500'>Octo</span>
                        )}
                    </div>

                    <div className={inputContainerClassName}>
                        {shouldShowCompactPrompt ? (
                            <>
                                {showCountdownPrompt ? (
                                    <>
                                        <div className='gai:flex gai:flex-1 gai:min-w-0 gai:overflow-hidden'>
                                            <span className='gai:line-clamp-3 gai:text-xs gai:md:text-sm gai:font-semibold gai:text-secondary-gray-900'>
                                                {displayPrompt}
                                            </span>
                                        </div>
                                        <div className='gai:flex gai:items-center gai:justify-between'>
                                            <span className='gai:text-[10px] gai:md:text-xs gai:font-medium gai:text-secondary-gray-500'>
                                                Prompting in...
                                            </span>
                                            <Button
                                                size={'icon'}
                                                className='gai:pointer-events-none gai:flex-shrink-0 gai:rounded-full gai:h-9 gai:w-9'
                                            >
                                                <span className='gai:text-xs gai:md:text-sm gai:font-semibold gai:text-white'>{countdown}</span>
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='gai:flex gai:flex-1 gai:flex-col gai:gap-1 gai:min-w-0 gai:overflow-hidden gai:pl-4'>
                                            <span className='gai:text-[9px] gai:md:text-[10px] gai:font-medium gai:uppercase gai:tracking-wide gai:text-secondary-gray-500'>
                                                Suggested
                                            </span>
                                            <span className='gai:line-clamp-3 gai:text-xs gai:md:text-sm gai:font-semibold gai:text-secondary-gray-900'>
                                                {displayPrompt}
                                            </span>
                                        </div>
                                        <Button
                                            disabled={creatingSession || isLoading || !displayPrompt || !onSuggestedPromptSend}
                                            size={'icon'}
                                            onClick={() => {
                                                handleActivate();
                                                if (onSuggestedPromptSend) {
                                                    onSuggestedPromptSend();
                                                }
                                            }}
                                            className='gai:cursor-pointer gai:flex-shrink-0 gai:rounded-full gai:h-9 gai:w-9'
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
                                    className='gai:flex-1 gai:min-w-0 gai:max-h-[120px] gai:resize-none gai:overflow-y-auto gai:border-0 gai:bg-transparent gai:text-sm gai:md:text-base gai:font-medium gai:leading-5 gai:md:leading-6 gai:text-secondary-gray-900 gai:outline-0 gai:placeholder:text-secondary-gray-600 gai:placeholder:text-xs gai:md:placeholder:text-sm gai:min-h-[32px] gai:py-1.5 gai:text-left'
                                    placeholder='Type your message here...'
                                    onInput={e => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = '32px';
                                        target.style.height = Math.min(Math.max(target.scrollHeight, 32), 120) + 'px';
                                    }}
                                    onFocus={() => {
                                        handleActivate();
                                    }}
                                    onBlur={() => {
                                        // Blur handler
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
                                    className='gai:cursor-pointer gai:flex-shrink-0 gai:rounded-full gai:h-9 gai:w-9'
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
