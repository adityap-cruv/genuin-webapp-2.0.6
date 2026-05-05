import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
import type { HandleSendMessageParams } from '@/context/app/provider';
import type { Agent, Artifact, ChatHistoryEvent, ThinkingStep } from '@/types';

import AttachmentCard from '../Attachments/AttachmentCard';
import { Button } from '../ui/button';

import AgentTextContent from './AgentTextContent';
import CarousalEmbed from './CarousalEmbed';
import { EditUserMessage } from './EditUserMessage';
import ThinkingIndicator from './ThinkingIndicator';
import ThinkingStatusList from './ThinkingStatusList';

// Lazy load widgets - chunks only loaded when included in contentOrder
const InventoryWidget = lazy(() => import('./InventoryWidget'));
const KoahAdWidget = lazy(() => import('./KoahAdWidget'));

const ThinkingMessages = () => {
    return (
        <div className='gai:font-body-2-med gai:text-secondary-gray-600 gai:italic'>
            <ThinkingIndicator />
        </div>
    );
};

const FeedbackButton = ({
    iconName,
    onClick,
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
        ChevronLeft: (
            <ChevronLeft className='gai:h-5 gai:w-5 gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />
        ),
        ChevronRight: (
            <ChevronRight className='gai:h-5 gai:w-5 gai:text-secondary-gray-600 gai:hover:text-secondary-gray-900' />
        ),
    };

    // if(iconName === 'Edit' && onBoardingAgents.includes(currentAgent)) {
    //     return null;
    // }

    return (
        <div>
            <Button
                size='icon'
                className='gai:flex gai:cursor-pointer gai:items-center gai:gap-1 gai:rounded-md gai:border-0 gai:bg-transparent gai:p-0 gai:py-0 gai:text-secondary-gray-600 gai:shadow-none gai:hover:bg-primary-50 gai:hover:text-secondary-gray-900'
                onClick={onClick}
            >
                {IconMap[iconName]}
            </Button>
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
                            className='gai:flex-1 gai:hover:border-primary-200'
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
    allEvents: ChatHistoryEvent[];
    messageType: 'user' | 'agent';
    currentSessionId: string | null;
    currentAgent: string;
    agents: Agent[];
    onBoardingAgents: string[];
    isLastMessage: boolean;
    sessionThinking?: boolean;
    isSdkLoaded: boolean;
    isKoahSdkLoaded: boolean;
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
        const chunkSize = Math.min(STREAM_CHUNK_MAX, Math.max(STREAM_CHUNK_MIN, Math.ceil(pendingLength / 6)));
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
    allEvents,
    messageType,
    currentSessionId,
    currentAgent,
    onBoardingAgents,
    isLastMessage,
    sessionThinking,
    isSdkLoaded,
    isKoahSdkLoaded,
    // setFeedback,
    handleSendMessage,
    view,
    thinkingSteps,
}) => {
    // Get the message content
    const content = event.message.content;

    // Find user question for agent messages (used for Koah ads)
    // Look for the most recent user message before this agent event
    const userQuestion =
        messageType === 'agent'
            ? (() => {
                  const currentIndex = allEvents.findIndex(e => e.id === event.id);
                  // Search backwards from current event to find the last user message
                  for (let i = currentIndex - 1; i >= 0; i--) {
                      const evt = allEvents[i];
                      if (evt?.role === 'user' && evt.message?.content) {
                          return evt.message.content;
                      }
                  }
                  return null;
              })()
            : null;

    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(content);
    const [showKoahAd, setShowKoahAd] = useState(!event.is_cached);
    const [shouldRenderKoahAd, setShouldRenderKoahAd] = useState(false);
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
                editedChatId: event.id,
            });
            setIsEditing(false);
        } catch {
            toast.error('Failed to send edited message');
        }
    };

    const messageId = event.id ?? '';
    const normalizedContent = content || '';
    const streamingActive = messageType === 'agent' && isLastMessage && Boolean(sessionThinking) && !event.isCompleted;
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
            setShowKoahAd(true);
            setShowInventoryWidget(true);
            setShowCarousel(true);
            return;
        }

        // Cached: wait for text animation to finish, then show components sequentially
        // Order: Koah Ad -> Inventory Widget -> Carousel
        if (hasFinished) {
            const timer0 = setTimeout(() => {
                setShowKoahAd(true);
            }, 150);
            const timer1 = setTimeout(() => {
                setShowInventoryWidget(true);
            }, 300);
            const timer2 = setTimeout(() => {
                setShowCarousel(true);
            }, 600);
            return () => {
                clearTimeout(timer0);
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [hasFinished, event.is_cached]);

    useEffect(() => {
        setShouldRenderKoahAd(Boolean(isKoahSdkLoaded && showKoahAd));
    }, [isKoahSdkLoaded, showKoahAd]);

    const toolMetadata = event.metadata?.toolMetadata;

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
                            <FeedbackButton
                                iconName={copied ? 'Copied' : 'Copy'}
                                onClick={handleCopy}
                                onBoardingAgents={onBoardingAgents}
                                currentAgent={currentAgent}
                            />
                            {/* <FeedbackButton iconName='Edit' onClick={startEditing} onBoardingAgents={onBoardingAgents} currentAgent={currentAgent} /> */}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`gai:flex gai:w-full ${view === 'web-sdk' ? 'gai:flex-col' : 'gai:flex-row'} gai:gap-2`}
                >
                    {/* Thinking indicators - always at the top, before any content */}
                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-2'>
                        {/* Show agent thinking status list - stays until response_completed */}
                        {view === 'web-sdk' && isLastMessage && sessionThinking && thinkingSteps.length > 0 && (
                            <ThinkingStatusList steps={thinkingSteps} />
                        )}
                        {/* Show thinking skeleton - hide when any agent content has arrived */}
                        {(() => {
                            const hasAnyContent = !!(
                                content || // Has agent text
                                event.carousel_metadata || // Has videos
                                toolMetadata || // Has inventory
                                (userQuestion && event.contentSequence?.includes('koah_ads')) // Has koah ads data
                            );
                            const shouldShowSkeleton =
                                isLastMessage &&
                                sessionThinking &&
                                messageType === 'agent' &&
                                !hasAnyContent &&
                                !(view === 'web-sdk' && thinkingSteps.length > 0);

                            return shouldShowSkeleton ? <ThinkingMessages /> : null;
                        })()}
                    </div>

                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-2'>
                        {event.contentSequence?.map(contentType => {
                            switch (contentType) {
                                case 'koah_ads': {
                                    // Find the actual agent text response (not tool/function content)
                                    const agentTextResponse = (() => {
                                        // Look for the last agent message with actual text content
                                        const currentIndex = allEvents.findIndex(e => e.id === event.id);
                                        for (let i = currentIndex; i >= 0; i--) {
                                            const evt = allEvents[i];
                                            // Find agent message with content that's not a function/tool
                                            if (
                                                evt?.role === 'agent' &&
                                                evt.message?.content &&
                                                !evt.message.function_name &&
                                                !evt.message.function_response
                                            ) {
                                                return evt.message.content;
                                            }
                                        }
                                        return ''; // No agent text yet
                                    })();

                                    // Show Koah ads when conditions are met
                                    if (shouldRenderKoahAd) {
                                        return (
                                            <Suspense key={contentType} fallback={null}>
                                                <KoahAdWidget
                                                    userMessage={userQuestion}
                                                    aiResponse={agentTextResponse}
                                                    messageId={event.id}
                                                />
                                            </Suspense>
                                        );
                                    }
                                    return null;
                                }

                                case 'agent_text': {
                                    // Render agent text content
                                    return (
                                        <AgentTextContent
                                            key={contentType}
                                            event={event}
                                            displayText={displayText}
                                            normalizedContent={normalizedContent}
                                            isAnimating={isAnimating}
                                            hasFinished={hasFinished}
                                            isLastMessage={isLastMessage}
                                            sessionThinking={sessionThinking}
                                        />
                                    );
                                }

                                case 'videos': {
                                    // Show carousel when conditions are met
                                    if (shouldRenderCarousel && showCarousel) {
                                        return (
                                            <CarousalEmbed
                                                key={contentType}
                                                carousalMetadata={event.carousel_metadata}
                                                isLastMessage={isLastMessage}
                                                isSdkLoaded={isSdkLoaded}
                                            />
                                        );
                                    }
                                    return null;
                                }

                                case 'inventory': {
                                    // Show inventory widget when tool metadata exists
                                    if (toolMetadata && showInventoryWidget) {
                                        return (
                                            <Suspense key={contentType} fallback={null}>
                                                <InventoryWidget metadata={toolMetadata} />
                                            </Suspense>
                                        );
                                    }
                                    return null;
                                }

                                default:
                                    return null;
                            }
                        })}
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
        prevProps.allEvents.length === nextProps.allEvents.length &&
        Boolean(prevProps.event.carousel_metadata) === Boolean(nextProps.event.carousel_metadata) &&
        prevProps.isKoahSdkLoaded === nextProps.isKoahSdkLoaded
    );
});

export default Item;
