import {
    ChevronLeft,
    ChevronRight,
    Copied,
    Copy,
    DislikeEmpty,
    DislikeFilled,
    Edit,
    LikeEmpty,
    LikeFilled,
    Regenerate,
} from '@/assets/SvgIcons/icons';
// import { responseFeedback } from '@/lib/api';
import type { Agent, Artifact, ChatHistoryEvent, ThinkingStep } from '@/types';
import type { HandleSendMessageParams } from '@/context/app/provider';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import BrandAssets from '../BCC/BrandAssets';
import BrandCTKWs from '../BCC/BrandCTKWs';
import BrandGuidelines from '../BCC/BrandGuidelines';
import BrandIndustryType from '../BCC/BrandIndustryType';
import BrandPersona from '../BCC/BrandPersona';
import { Button } from '../ui/button';
import Markdown from './Markdown';
import VideoPlayer from './VideoPlayer';
import CarousalEmbed from './CarousalEmbed';
import AttachmentCard from '../Attachments/AttachmentCard';
import BrandConsumerBrands from '../BCC/BrandConsumerBrands';
import BrandSocialHandleFetcher from '../BCC/BrandSocialHandleFetcher';
import { EditUserMessage } from './EditUserMessage';
import ThinkingIndicator from './ThinkingIndicator';
import VideoMetadata from './VideoMetadata';
import InventoryWidget from './InventoryWidget';
import { getCachedRemoteLottie, loadRemoteLottie } from '@/lib/lottie/load-remote-lottie';
import ThinkingStatusList from './ThinkingStatusList';

const AGENT_THINKING_ANIMATION_PATH =
    'Small thinking/animations/f151a6e3-0e0c-414c-9c71-621a2d9f4a2b.json';
const AGENT_THINKING_IMAGES_PATH = 'Small thinking/';

const AGENT_SLEEPING_ANIMATION_PATH =
    'sleeping/animations/51914e32-e62c-43d5-b17d-50369bbbf7d6.json';
const AGENT_SLEEPING_IMAGES_PATH = 'sleeping/';

const FeedbackButton = ({
    iconName,
    onClick
}: {
    iconName: string;
    onClick: (e: React.MouseEvent) => void;
    onBoardingAgents: string[];
    currentAgent: string;
}) => {
    const IconMap: Record<string, React.ReactNode> = {
        LikeFilled: <LikeFilled className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        DislikeFilled: <DislikeFilled className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        Copied: <Copied className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        Copy: <Copy className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        LikeEmpty: <LikeEmpty className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        DislikeEmpty: <DislikeEmpty className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        Regenerate: <Regenerate className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        Edit: <Edit className='gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        ChevronLeft: <ChevronLeft className='gai:h-5 gai:w-5 gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
        ChevronRight: <ChevronRight className='gai:h-5 gai:w-5 gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />,
    };

    // if(iconName === 'Edit' && onBoardingAgents.includes(currentAgent)) {
    //     return null;
    // }

    return (
        <div>
            <Button
                size='icon'
                className='gai:flex gai:cursor-pointer gai:items-center gai:gap-1 gai:border-0 gai:bg-transparent gai:p-0 gai:py-0 gai:text-secondary-gray-600 gai:shadow-none gai:rounded-md gai:hover:bg-primary-50 gai:hover:text-secondary-gray-900'
                onClick={onClick}
            >
                {IconMap[iconName]}
            </Button>
        </div>
    );
};

const ThinkingMessages = () => {
    return (
        <div className='gai:font-body-2-med gai:text-secondary-gray-600 gai:italic'>
            <ThinkingIndicator />
        </div>
    );
};

const ArtifactsList = ({ artifacts }: { artifacts: Artifact[] }) => {
    if (!artifacts || artifacts.length === 0) return null;

    const getArtifactUrl = (artifact: Artifact) => {
        if (!artifact.s3_key) return undefined;
        if (artifact.s3_key.startsWith('http')) return artifact.s3_key;
        const baseUrl = import.meta.env.VITE_ASSET_BASE_URL || 'https://ds-dataset-rvc.s3.us-west-2.amazonaws.com';
        const encodedKey = artifact.s3_key
            .split('/')
            .map(segment => encodeURIComponent(segment))
            .join('/');
        return `${baseUrl}/${encodedKey}`;
    };

    return (
        <div className='gai:flex gai:flex-wrap gai:gap-3'>
            {artifacts.map(artifact => {
                const url = getArtifactUrl(artifact);
                const isImage = artifact.type?.startsWith('image/');
                const previewUrl = isImage && url ? url : undefined;
                const card = (
                    <AttachmentCard name={artifact.name} type={artifact.type} previewUrl={previewUrl} className='' />
                );

                if (url) {
                    return (
                        <a
                            key={artifact.id}
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='gai:hover:border-primary-200 gai:flex-1'
                        >
                            {card}
                        </a>
                    );
                }

                return (
                    <div key={artifact.id} aria-disabled className='gai:flex-1'>
                        {card}
                    </div>
                );
            })}
        </div>
    );
};

type ItemProps = {
    event: ChatHistoryEvent;
    messageType: 'user' | 'agent';
    currentSessionId: string | null;
    currentAgent: string;
    agents: Agent[];
    onBoardingAgents: string[];
    isLastMessage: boolean;
    sessionThinking?: boolean;
    isSdkLoaded: boolean;
    setFeedback: (sessionId: string, responseId: string, liked: boolean) => void;
    handleSendMessage: (params: HandleSendMessageParams) => Promise<void>;
    view: 'page' | 'floater' | 'dialog' | 'web-sdk';
    thinkingSteps: ThinkingStep[];
};

// Tune chunk sizes to balance timeliness vs. smooth streaming feel.
const STREAM_CHUNK_MIN = 2;
const STREAM_CHUNK_MAX = 20;

// Incrementally reveals the agent response so SSE chunks render like a typewriter.
const useStreamingDisplay = ({
    messageId,
    content,
    isStreaming,
    isCompleted,
    initialDisplay,
    isCached,
}: {
    messageId: string | null;
    content: string;
    isStreaming: boolean;
    isCompleted: boolean;
    initialDisplay: string;
    isCached?: boolean;
}) => {
    const [displayText, setDisplayText] = useState(content);
    const pendingRef = useRef('');
    const lastContentRef = useRef(content);
    const displayRef = useRef(content);
    const frameRef = useRef<number | null>(null);
    const hasStreamedRef = useRef(false);
    const animationInitializedRef = useRef(false); // Guard to prevent re-initialization

    const cancelFrame = () => {
        if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
    };

    const stepReveal = useCallback(() => {
        if (!pendingRef.current.length) {
            frameRef.current = null;
            return;
        }

        const pendingLength = pendingRef.current.length;
        const chunkSize = Math.min(
            STREAM_CHUNK_MAX,
            Math.max(STREAM_CHUNK_MIN, Math.ceil(pendingLength / 6))
        );
        const nextChunk = pendingRef.current.slice(0, chunkSize);
        pendingRef.current = pendingRef.current.slice(chunkSize);

        const nextDisplay = displayRef.current + nextChunk;
        displayRef.current = nextDisplay;
        setDisplayText(nextDisplay);

        frameRef.current = requestAnimationFrame(stepReveal);
    }, []);

    useEffect(() => {
        return () => {
            cancelFrame();
        };
    }, []);

    useEffect(() => {
        cancelFrame();
        pendingRef.current = '';
        lastContentRef.current = '';
        hasStreamedRef.current = false;
        animationInitializedRef.current = false; // Reset initialization flag for new message
        displayRef.current = initialDisplay;
        setDisplayText(initialDisplay);
    }, [messageId, initialDisplay]);

    useEffect(() => {
        const nextContent = content;
        const prevContent = lastContentRef.current;
        if (nextContent === prevContent) return;

        // For cached messages, treat them as streaming even if isStreaming is false
        const shouldStream = isStreaming || (isCached && !hasStreamedRef.current);

        // If animation already initialized for cached message, skip
        if (isCached && animationInitializedRef.current) {
            return;
        }

        if (!shouldStream) {
            if (!hasStreamedRef.current) {
                lastContentRef.current = nextContent;
                pendingRef.current = '';
                displayRef.current = nextContent;
                setDisplayText(nextContent);
                cancelFrame();
            }
            return;
        }

        // Mark animation as initialized for cached messages
        if (isCached && !animationInitializedRef.current) {
            animationInitializedRef.current = true;
        }

        if (nextContent.length < prevContent.length) {
            lastContentRef.current = nextContent;
            pendingRef.current = '';
            displayRef.current = nextContent;
            setDisplayText(nextContent);
            cancelFrame();
            hasStreamedRef.current = false;
            return;
        }

        const diff = nextContent.slice(prevContent.length);
        if (!diff) return;

        pendingRef.current += diff;
        lastContentRef.current = nextContent;
        hasStreamedRef.current = true;

        if (frameRef.current === null) {
            frameRef.current = requestAnimationFrame(stepReveal);
        }
    }, [content, isStreaming, isCached, stepReveal]);

    useEffect(() => {
        if (!isStreaming && isCompleted) {
            if (pendingRef.current.length) {
                if (frameRef.current === null) {
                    frameRef.current = requestAnimationFrame(stepReveal);
                }
            } else {
                displayRef.current = content;
                setDisplayText(content);
                cancelFrame();
            }
        } else if (isCompleted && pendingRef.current.length && frameRef.current === null) {
            frameRef.current = requestAnimationFrame(stepReveal);
        }
    }, [isStreaming, isCompleted, content, stepReveal]);

    const isAnimating = displayText !== content;
    const hasFinished = displayText === content;

    return { displayText, isAnimating, hasFinished };
};

const ItemComponent: React.FC<ItemProps> = ({
    event,
    messageType,
    currentSessionId,
    currentAgent,
    agents: _agents,
    onBoardingAgents,
    isLastMessage,
    sessionThinking,
    isSdkLoaded,
    // setFeedback,
    handleSendMessage,
    view,
    thinkingSteps,
}) => {
    // Get the message content
    const content = event.message.content;
    const functionName = event.message.function_name;
    const functionResponse = event.message.function_response;

    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(content);
    const [showInventoryWidget, setShowInventoryWidget] = useState(!event.is_cached);
    const [showCarousel, setShowCarousel] = useState(!event.is_cached);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (error) {
            console.error('[MessageItem] Failed to copy message content', error);
        }
    };

    // const startEditing = () => {
    //     if (messageType !== 'user') return;
    //     setEditedText(content || '');
    //     setIsEditing(true);
    // };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditedText(content || '');
    };

    const submitEdit = () => {
        if (!editedText?.trim() || !currentSessionId) return;
        try {
            handleSendMessage({
                targetSessionId: currentSessionId,
                messageInput: editedText,
                agent_id: currentAgent,
                editedChatId: event.id
            });
            setIsEditing(false);
        } catch {
            toast.error('Failed to send edited message');
        }
    };

    const [agentThinkingLottieData, setAgentThinkingLottieData] = useState<object | null>(() =>
        getCachedRemoteLottie(AGENT_THINKING_ANIMATION_PATH, AGENT_THINKING_IMAGES_PATH)
    );
    const [agentIdleLottieData, setAgentIdleLottieData] = useState<object | null>(() =>
        getCachedRemoteLottie(AGENT_SLEEPING_ANIMATION_PATH, AGENT_SLEEPING_IMAGES_PATH)
    );
    const [thinkingLottieError, setThinkingLottieError] = useState(false);
    const [idleLottieError, setIdleLottieError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (!agentThinkingLottieData && !thinkingLottieError) {
            loadRemoteLottie(AGENT_THINKING_ANIMATION_PATH, AGENT_THINKING_IMAGES_PATH)
                .then(data => {
                    if (!cancelled) {
                        setAgentThinkingLottieData(data);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setThinkingLottieError(true);
                    }
                });
        }

        if (!agentIdleLottieData && !idleLottieError) {
            loadRemoteLottie(AGENT_SLEEPING_ANIMATION_PATH, AGENT_SLEEPING_IMAGES_PATH)
                .then(data => {
                    if (!cancelled) {
                        setAgentIdleLottieData(data);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setIdleLottieError(true);
                    }
                });
        }

        return () => {
            cancelled = true;
        };
    }, [
        agentThinkingLottieData,
        agentIdleLottieData,
        thinkingLottieError,
        idleLottieError,
    ]);

    const messageId = event.id ?? '';
    const normalizedContent = content || '';
    const streamingActive =
        messageType === 'agent' &&
        isLastMessage &&
        Boolean(sessionThinking) &&
        !event.isCompleted;
    const shouldAnimateOnMount =
        messageType === 'agent' &&
        (event.is_cached || (isLastMessage && (!event.isCompleted || Boolean(sessionThinking))));
    const initialDisplay = shouldAnimateOnMount ? '' : normalizedContent;

    const { displayText, isAnimating, hasFinished } = useStreamingDisplay({
        messageId,
        content: normalizedContent,
        isStreaming: streamingActive,
        isCompleted: Boolean(event.isCompleted),
        initialDisplay,
        isCached: event.is_cached,
    });

    // Handle delayed rendering for cached messages
    useEffect(() => {
        if (!event.is_cached) {
            // Non-cached: show everything immediately
            setShowInventoryWidget(true);
            setShowCarousel(true);
            return;
        }

        // Cached: wait for text animation to finish, then show components sequentially
        if (hasFinished) {
            const timer1 = setTimeout(() => {
                setShowInventoryWidget(true);
            }, 300);
            const timer2 = setTimeout(() => {
                setShowCarousel(true);
            }, 600);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [hasFinished, event.is_cached]);

    const toolMetadata = event.metadata?.toolMetadata;
    const isToolMetadataEvent = Boolean(toolMetadata);

    const shouldRenderCarousel = messageType === 'agent' && Boolean(event.carousel_metadata);

    // const handleFeedback = async (e: React.MouseEvent, liked: boolean) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     try {
    //         await responseFeedback({
    //             session_id: currentSessionId as string,
    //             response_id: event.id,
    //             feedback: liked,
    //         });
    //         setFeedback(currentSessionId as string, event.id, liked);
    //     } catch (error) {
    //         toast.error('Failed to submit feedback');
    //     }
    // };

    // we may have function name


    return (
        <div className={`gai:flex gai:w-full ${messageType === 'user' ? 'gai:justify-end' : 'gai:justify-start'}`}>
            {messageType === 'user' ? (
                <div
                    className={`gai:flex ${
                        isEditing ? 'gai:w-full' : 'gai:w-[80%]'
                    } gai:flex-col gai:items-end gai:gap-2`}
                >
                    <div
                        className={`gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:px-4 gai:py-3 gai:font-body-1-med gai:text-secondary-gray-900 ${
                            isEditing ? 'gai:w-full' : 'gai:max-w-[80%]'
                        }`}
                    >
                        {isEditing ? (
                            <EditUserMessage
                                value={editedText}
                                onChange={setEditedText}
                                onCancel={cancelEditing}
                                onSubmit={submitEdit}
                            />
                        ) : (
                            content
                        )}
                    </div>
                    {!isEditing && event.artifacts && event.artifacts.length > 0 && (
                        <ArtifactsList artifacts={event.artifacts} />
                    )}
                    {!isEditing && view !== 'web-sdk' && (
                        <div className='gai:flex gai:items-center gai:gap-0'>
                            <FeedbackButton iconName={copied ? 'Copied' : 'Copy'} onClick={handleCopy} onBoardingAgents={onBoardingAgents} currentAgent={currentAgent} />
                            {/* <FeedbackButton iconName='Edit' onClick={startEditing} onBoardingAgents={onBoardingAgents} currentAgent={currentAgent} /> */}
                        </div>
                    )}
                </div>
            ) : (
                <div className={`gai:flex gai:w-full ${view === 'web-sdk' ? 'gai:flex-col' : 'gai:flex-row'} gai:gap-2`}>
                    {/* Show agent thinking status (without avatar animation) for web-sdk view */}
                    {view === 'web-sdk' && !isToolMetadataEvent && isLastMessage && sessionThinking && thinkingSteps.length > 0 && (
                        <ThinkingStatusList steps={thinkingSteps} />
                    )}

                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-2'>
                        {(() => {
                            // Show thinking indicator if this is the last agent message and session is thinking but no content
                            if (isLastMessage && sessionThinking && messageType === 'agent' && !content?.trim()) {
                                return <ThinkingMessages />;
                            }

                            // const hasError =
                            //     !sessionThinking && (!!event.error || (!content?.trim() && !sessionThinking));

                            // if (hasError) {
                            //     return (
                            //         <div className='gai:max-w-[80%] gai:rounded-xl gai:border gai:border-red-300 gai:bg-red-50 gai:px-4 gai:py-3'>
                            //             <div className='gai:font-body-2-med gai:text-red-700'>Something went wrong</div>
                            //             <div className='gai:mt-1 gai:text-sm gai:text-secondary-gray-700'>
                            //                 Please try again.
                            //             </div>
                            //         </div>
                            //     );
                            // }
                            if (toolMetadata && showInventoryWidget) {
                                return <InventoryWidget metadata={toolMetadata} />;
                            }

                            if (functionName === 'video_generator_agent') {
                                return (
                                    <>
                                        <VideoMetadata content={content} metadata={event.metadata} />
                                        {event.metadata?.video_meta?.url && event.metadata?.video_meta?.thumbnail && (
                                            <VideoPlayer
                                                videoUrl={event.metadata?.video_meta?.url}
                                                thumbnailUrl={event.metadata?.video_meta?.thumbnail}
                                            />
                                        )}
                                    </>
                                );
                            } else if (functionName === 'consumer_brands_agent') {
                                return (
                                    <BrandConsumerBrands
                                        messageId={event.id}
                                        existing={functionResponse?.existing}
                                        new={functionResponse?.new}
                                    />
                                );
                            } else if (functionName === 'get_ctkws') {
                                return <BrandCTKWs jsonData={functionResponse.result} messageId={event.id} />;
                            } else if (functionName === 'get_brand_asset') {
                                return <BrandAssets jsonData={functionResponse} messageId={event.id} />;
                            } else if (functionName === 'get_brand_guidelines_') {
                                return <BrandGuidelines jsonData={functionResponse.result} messageId={event.id} />;
                            } else if (functionName === 'get_brand_persona_') {
                                return <BrandPersona jsonData={functionResponse.result} messageId={event.id} />;
                            } else if (functionName === 'industry_type_agent') {
                                return <BrandIndustryType jsonData={functionResponse} messageId={event.id} />;
                            } else if (functionName === 'social_handle_fetcher_agent') {
                                return <BrandSocialHandleFetcher jsonData={functionResponse} messageId={event.id} />;
                            } else {
                                return (
                                    <div className='markdown-content'>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeRaw]}
                                            components={Markdown}
                                        >
                                            {displayText || (event.isCompleted ? normalizedContent : '')}
                                        </ReactMarkdown>
                                        {isAnimating || !hasFinished ? (
                                            <span className='gai:inline-block gai:animate-pulse gai:text-secondary-gray-600'>|</span>
                                        ) : null}
                                        {event.metadata?.wasStopped && event.isCompleted ? (
                                            <span className='gai:mt-2 gai:block gai:text-xs gai:font-medium gai:text-secondary-gray-500'>
                                                Response stopped
                                            </span>
                                        ) : null}
                                    </div>
                                );
                            }
                        })()}
                        {/* Show carousel/skeleton for web-sdk view */}
                        {shouldRenderCarousel && showCarousel && (
                            <CarousalEmbed
                                carousalMetadata={event.carousel_metadata}
                                isLastMessage={isLastMessage}
                                isSdkLoaded={isSdkLoaded}
                            />
                        )}
                        {/* Show feedback buttons when not thinking (streaming/response completed) */}
                        {/* {!sessionThinking && (
                            <div
                                className={`gai:mt-1 gai:flex gai:items-center gai:justify-between gai:gap-3 ${isLastMessage ? 'gai:pb-4' : ''}`}
                            >
                                <div className='gai:flex gai:items-center gai:gap-0'>
                                    {messageType === 'agent' && (
                                        <>
                                            {event.feedback === true && (
                                                <FeedbackButton
                                                    iconName='LikeFilled'
                                                    onClick={(e: React.MouseEvent) => e.preventDefault()}
                                                    onBoardingAgents={onBoardingAgents}
                                                    currentAgent={currentAgent}
                                                />
                                            )}
                                            {event.feedback === false && (
                                                <FeedbackButton
                                                    iconName='DislikeFilled'
                                                    onClick={(e: React.MouseEvent) => e.preventDefault()}
                                                    onBoardingAgents={onBoardingAgents}
                                                    currentAgent={currentAgent}
                                                />
                                            )}
                                            {event.feedback === null && (
                                                <>
                                                    <FeedbackButton
                                                        iconName='LikeEmpty'
                                                        onClick={(e: React.MouseEvent) => handleFeedback(e, true)}
                                                        onBoardingAgents={onBoardingAgents}
                                                        currentAgent={currentAgent}
                                                    />
                                                    <FeedbackButton
                                                        iconName='DislikeEmpty'
                                                        onClick={(e: React.MouseEvent) => handleFeedback(e, false)}
                                                        onBoardingAgents={onBoardingAgents}
                                                        currentAgent={currentAgent}
                                                    />
                                                </>
                                            )}
                                        </>
                                    )}
                                    {onBoardingAgents.includes(currentAgent) ? (
                                        <FeedbackButton
                                            iconName={'Regenerate'}
                                            onClick={() => toast.info('Upcoming feature')}
                                            onBoardingAgents={onBoardingAgents}
                                            currentAgent={currentAgent}
                                        />
                                    ) : (
                                        <FeedbackButton iconName={copied ? 'Copied' : 'Copy'} onClick={handleCopy} onBoardingAgents={onBoardingAgents} currentAgent={currentAgent}  />
                                    )}
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            )}
        </div>
    );
};

const Item = React.memo(ItemComponent, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
        prevProps.event.id === nextProps.event.id &&
        prevProps.event.message.content === nextProps.event.message.content &&
        prevProps.event.isCompleted === nextProps.event.isCompleted &&
        prevProps.event.is_cached === nextProps.event.is_cached &&
        prevProps.isLastMessage === nextProps.isLastMessage &&
        prevProps.sessionThinking === nextProps.sessionThinking &&
        prevProps.thinkingSteps.length === nextProps.thinkingSteps.length &&
        Boolean(prevProps.event.carousel_metadata) === Boolean(nextProps.event.carousel_metadata)
    );
});

export default Item;
