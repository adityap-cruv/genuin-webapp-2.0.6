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
import type { HandleSendMessageParams } from '@/modules/chat/types';
import { useUIContext } from '@/stores/ui/context';
import type { Agent, Artifact, ChatHistoryEvent, ThinkingStep } from '@/types';
import { cn } from '@/utils/cn';

import AttachmentCard from '../Attachments/AttachmentCard';
import { Button } from '../ui/button';

import AgentTextContent from './AgentTextContent';
import CarousalEmbed from './CarousalEmbed';
import { EditUserMessage } from './EditUserMessage';
import ThinkingIndicator from './ThinkingIndicator';
import ThinkingStatusList from './ThinkingStatusList';

// Lazy load widgets — chunks only loaded when included in contentOrder
const InventoryWidget = lazy(() => import('./InventoryWidget'));
const KoahAdWidget = lazy(() => import('./KoahAdWidget'));

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ThinkingMessages() {
    return (
        <div className='gai:font-body-2-med gai:text-secondary-gray-600 gai:italic'>
            <ThinkingIndicator />
        </div>
    );
}

const ICON_MAP: Record<string, React.ReactNode> = {
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

function FeedbackButton({ iconName, onClick }: { iconName: string; onClick: (e: React.MouseEvent) => void }) {
    return (
        <Button
            size='icon'
            className='gai:flex gai:cursor-pointer gai:items-center gai:gap-1 gai:rounded-md gai:border-0 gai:bg-transparent gai:p-0 gai:py-0 gai:text-secondary-gray-600 gai:shadow-none gai:hover:bg-primary-50 gai:hover:text-secondary-gray-900'
            onClick={onClick}
        >
            {ICON_MAP[iconName]}
        </Button>
    );
}

function ArtifactsList({ artifacts }: { artifacts: Artifact[] }) {
    if (!artifacts.length) return null;

    const getArtifactUrl = (artifact: Artifact) => {
        if (!artifact.s3_key) return undefined;
        if (artifact.s3_key.startsWith('http')) return artifact.s3_key;
        const baseUrl = import.meta.env.VITE_GENAI_ASSET_BASE_URL || 'https://ds-dataset-rvc.s3.us-west-2.amazonaws.com';
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
                const card = (
                    <AttachmentCard
                        name={artifact.name}
                        type={artifact.type}
                        previewUrl={isImage && url ? url : undefined}
                        className=''
                    />
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
}

// ---------------------------------------------------------------------------
// Density maps
// ---------------------------------------------------------------------------

/** Maps `uiDensity` to user chat bubble padding. */
const BUBBLE_PADDING: Record<'xs' | 'sm' | 'base', string> = {
    base: 'gai:px-4 gai:py-3',
    sm: 'gai:px-3 gai:py-2',
    xs: 'gai:px-2 gai:py-1',
};

/** Maps `uiDensity` to user chat bubble text size. */
const BUBBLE_TEXT_SIZE: Record<'xs' | 'sm' | 'base', string> = {
    base: 'gai:text-sm',
    sm: 'gai:text-xs',
    xs: 'gai:text-[10px]',
};

/** Maps `uiDensity` to user message wrapper width. xs = full-width to maximise limited space. */
const USER_MSG_WIDTH: Record<'xs' | 'sm' | 'base', string> = {
    base: 'gai:w-[80%]',
    sm: 'gai:w-[80%]',
    xs: 'gai:w-full',
};

/** Maps `uiDensity` to user bubble max-width. xs = full-width to maximise limited space. */
const USER_BUBBLE_MAX_WIDTH: Record<'xs' | 'sm' | 'base', string> = {
    base: 'gai:max-w-[80%]',
    sm: 'gai:max-w-[80%]',
    xs: 'gai:max-w-full',
};

// ---------------------------------------------------------------------------
// useStreamingDisplay
// ---------------------------------------------------------------------------

// Tune chunk sizes to balance timeliness vs. smooth streaming feel.
const STREAM_CHUNK_MIN = 2;
const STREAM_CHUNK_MAX = 20;

/** Incrementally reveals the agent response so SSE chunks render like a typewriter. */
function useStreamingDisplay({
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
}) {
    const [displayText, setDisplayText] = useState(content);
    const pendingRef = useRef('');
    const lastContentRef = useRef(content);
    const displayRef = useRef(content);
    const frameRef = useRef<number | null>(null);
    const hasStreamedRef = useRef(false);
    const animationInitializedRef = useRef(false);

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

        const chunkSize = Math.min(
            STREAM_CHUNK_MAX,
            Math.max(STREAM_CHUNK_MIN, Math.ceil(pendingRef.current.length / 6))
        );
        const nextChunk = pendingRef.current.slice(0, chunkSize);
        pendingRef.current = pendingRef.current.slice(chunkSize);

        const nextDisplay = displayRef.current + nextChunk;
        displayRef.current = nextDisplay;
        setDisplayText(nextDisplay);

        frameRef.current = requestAnimationFrame(stepReveal);
    }, []);

    useEffect(() => () => cancelFrame(), []);

    useEffect(() => {
        cancelFrame();
        pendingRef.current = '';
        lastContentRef.current = '';
        hasStreamedRef.current = false;
        animationInitializedRef.current = false;
        displayRef.current = initialDisplay;
        setDisplayText(initialDisplay);
    }, [messageId, initialDisplay]);

    useEffect(() => {
        const nextContent = content;
        const prevContent = lastContentRef.current;
        if (nextContent === prevContent) return;

        const shouldStream = isStreaming || (isCached && !hasStreamedRef.current);

        // Skip if animation already initialized for this cached message
        if (isCached && animationInitializedRef.current) return;

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

        if (isCached) animationInitializedRef.current = true;

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

    return { displayText, isAnimating: displayText !== content };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Finds the preceding user message content for a given agent event index. */
function findUserQuestion(allEvents: ChatHistoryEvent[], currentIndex: number): string | null {
    for (let i = currentIndex - 1; i >= 0; i--) {
        const evt = allEvents[i];
        if (evt?.role === 'user' && evt.message?.content) return evt.message.content;
    }
    return null;
}

/** Finds the last agent text response (non-tool/function) at or before the given index. */
function findAgentTextResponse(allEvents: ChatHistoryEvent[], currentIndex: number): string {
    for (let i = currentIndex; i >= 0; i--) {
        const evt = allEvents[i];
        if (
            evt?.role === 'agent' &&
            evt.message?.content &&
            !evt.message.function_name &&
            !evt.message.function_response
        ) {
            return evt.message.content;
        }
    }
    return '';
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// ItemComponent
// ---------------------------------------------------------------------------

function ItemComponent({
    event,
    allEvents,
    messageType,
    currentSessionId,
    currentAgent,
    isLastMessage,
    sessionThinking,
    isSdkLoaded,
    isKoahSdkLoaded,
    handleSendMessage,
    view,
    thinkingSteps,
}: ItemProps) {
    const { uiDensity } = useUIContext();
    const content = event.message.content;
    const normalizedContent = content || '';

    const currentIndex = allEvents.findIndex(e => e.id === event.id);
    const userQuestion = messageType === 'agent' ? findUserQuestion(allEvents, currentIndex) : null;

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
    const streamingActive = messageType === 'agent' && isLastMessage && Boolean(sessionThinking) && !event.isCompleted;
    const shouldAnimateOnMount =
        messageType === 'agent' &&
        (event.is_cached || (isLastMessage && (!event.isCompleted || Boolean(sessionThinking))));

    const { displayText, isAnimating } = useStreamingDisplay({
        messageId,
        content: normalizedContent,
        isStreaming: streamingActive,
        isCompleted: Boolean(event.isCompleted),
        initialDisplay: shouldAnimateOnMount ? '' : normalizedContent,
        isCached: event.is_cached,
    });

    const hasFinished = !isAnimating;

    // Delayed rendering for cached messages — show components sequentially after text finishes
    useEffect(() => {
        if (!event.is_cached) {
            setShowKoahAd(true);
            setShowInventoryWidget(true);
            setShowCarousel(true);
            return;
        }

        if (!hasFinished) return;

        // Order: Koah Ad → Inventory Widget → Carousel
        const t0 = setTimeout(() => setShowKoahAd(true), 150);
        const t1 = setTimeout(() => setShowInventoryWidget(true), 300);
        const t2 = setTimeout(() => setShowCarousel(true), 600);
        return () => {
            clearTimeout(t0);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [hasFinished, event.is_cached]);

    useEffect(() => {
        setShouldRenderKoahAd(Boolean(isKoahSdkLoaded && showKoahAd));
    }, [isKoahSdkLoaded, showKoahAd]);

    const toolMetadata = event.metadata?.toolMetadata;
    const shouldRenderCarousel = messageType === 'agent' && Boolean(event.carousel_metadata);

    // Thinking indicators — only rendered when at least one child is visible
    const showThinkingList = view === 'web-sdk' && isLastMessage && sessionThinking && thinkingSteps.length > 0;
    const hasAnyContent = !!(
        content ||
        event.carousel_metadata ||
        toolMetadata ||
        (userQuestion && event.contentSequence?.includes('koah_ads'))
    );
    const showSkeleton =
        isLastMessage &&
        sessionThinking &&
        messageType === 'agent' &&
        !hasAnyContent &&
        !(view === 'web-sdk' && thinkingSteps.length > 0);

    return (
        <div
            data-mid={event.id}
            className={`gai:flex gai:w-full ${messageType === 'user' ? 'gai:justify-end' : 'gai:justify-start'}`}
        >
            {messageType === 'user' ? (
                <div
                    className={cn(
                        'gai:flex gai:flex-col gai:items-end gai:gap-2',
                        isEditing ? 'gai:w-full' : USER_MSG_WIDTH[uiDensity]
                    )}
                >
                    <div
                        className={cn(
                            'gai:rounded-3xl gai:rounded-br-none gai:bg-primary-50 gai:font-body-1-med gai:text-secondary-gray-900',
                            BUBBLE_PADDING[uiDensity],
                            BUBBLE_TEXT_SIZE[uiDensity],
                            isEditing ? 'gai:w-full' : USER_BUBBLE_MAX_WIDTH[uiDensity]
                        )}
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

                    {!isEditing && !!event.artifacts?.length && <ArtifactsList artifacts={event.artifacts} />}

                    {!isEditing && view !== 'web-sdk' && (
                        <div className='gai:flex gai:items-center gai:gap-0'>
                            <FeedbackButton iconName={copied ? 'Copied' : 'Copy'} onClick={handleCopy} />
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`gai:flex gai:w-full ${view === 'web-sdk' ? 'gai:flex-col' : 'gai:flex-row'} gai:gap-2`}
                >
                    {(showThinkingList || showSkeleton) && (
                        <div className='gai:flex gai:w-full gai:flex-col gai:gap-2'>
                            {showThinkingList && <ThinkingStatusList steps={thinkingSteps} />}
                            {showSkeleton && <ThinkingMessages />}
                        </div>
                    )}

                    <div className='gai:flex gai:w-full gai:flex-col gai:gap-4'>
                        {event.contentSequence?.map(contentType => {
                            switch (contentType) {
                                case 'koah_ads': {
                                    if (!shouldRenderKoahAd) return null;
                                    return (
                                        <Suspense key={contentType} fallback={null}>
                                            <KoahAdWidget
                                                userMessage={userQuestion}
                                                aiResponse={findAgentTextResponse(allEvents, currentIndex)}
                                                messageId={event.id}
                                            />
                                        </Suspense>
                                    );
                                }

                                case 'agent_text': {
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
                                    if (!shouldRenderCarousel || !showCarousel) return null;
                                    return (
                                        <CarousalEmbed
                                            key={contentType}
                                            carousalMetadata={event.carousel_metadata}
                                            isLastMessage={isLastMessage}
                                            isSdkLoaded={isSdkLoaded}
                                        />
                                    );
                                }

                                case 'inventory': {
                                    if (!toolMetadata || !showInventoryWidget) return null;
                                    return (
                                        <Suspense key={contentType} fallback={null}>
                                            <InventoryWidget metadata={toolMetadata} />
                                        </Suspense>
                                    );
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
}

const Item = React.memo(
    ItemComponent,
    (prev, next) =>
        prev.event.id === next.event.id &&
        prev.event.message.content === next.event.message.content &&
        prev.event.isCompleted === next.event.isCompleted &&
        prev.event.is_cached === next.event.is_cached &&
        prev.isLastMessage === next.isLastMessage &&
        prev.sessionThinking === next.sessionThinking &&
        prev.thinkingSteps.length === next.thinkingSteps.length &&
        prev.allEvents.length === next.allEvents.length &&
        Boolean(prev.event.carousel_metadata) === Boolean(next.event.carousel_metadata) &&
        prev.isKoahSdkLoaded === next.isKoahSdkLoaded
);

export default Item;
