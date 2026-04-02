import { useAgentsContext } from '@/context/app/context';
import { useOctoAnalytics } from '@/context/analytics';
import type { CarousalMetadata } from '@/types';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

const generateRandomId = () => Math.floor(Math.random() * 1000) + 1;

interface GenuinInternalEvent {
    payload?: {
        videoId?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

type GenuinEventListener = (event: GenuinInternalEvent) => void;

declare global {
    interface Window {
        genuin: {
            init: (config: Record<string, unknown>) => void;
            destroy: () => void;
            update?: (config: Record<string, unknown>) => Promise<void> | void;
            onInternal?: (
                eventName: string,
                listener: GenuinEventListener
            ) => (() => void) | void;
            offInternal?: (eventName: string, listener: GenuinEventListener) => void;
        };
    }
}

const GenuinEmbed = ({
    carousalMetadata,
    isLastMessage,
    isSdkLoaded,
}: {
    carousalMetadata?: CarousalMetadata;
    isLastMessage: boolean;
    isSdkLoaded: boolean;
}) => {
    const {
        sessions,
        currentSessionId,
        isSidebarCollapsed,
        view,
        parentWebSdkInstanceId,
        parentWebSdkContainerId,
        parentWebSdkEmbedId,
        parentWebSdkPlacementId,
        parentOctoPanelId,
    } = useAgentsContext();
    const { analytics } = useOctoAnalytics();
    const currentSession = sessions.find((s) => s.id === currentSessionId);

    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const isInitializedRef = useRef(false);
    const childInstanceIdRef = useRef<string | null>(null);
    const forwardedVideoRef = useRef<{ id: string; ts: number } | null>(null);

    const [randomId] = useState(() => generateRandomId());
    const sdkId = `gen-sdk-${randomId}`;

    useEffect(() => {
        const updateWidth = () => {
            if (wrapperRef.current) {
                setContainerWidth(wrapperRef.current.offsetWidth || 0);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [isSidebarCollapsed]);

    useLayoutEffect(() => {
        const sdkUnavailable = !isSdkLoaded && !window.genuin;

        if (
            isInitializedRef.current ||
            !containerRef.current ||
            sdkUnavailable ||
            !carousalMetadata ||
            (!carousalMetadata.video_ids && !carousalMetadata.keywords)
        ) {
            return;
        }

        const isWebSdkView = view === 'web-sdk';

        if (isWebSdkView) {
            if (!parentWebSdkInstanceId) {
                console.error('[CarousalEmbed] Cannot initialize nested SDK: parent instance ID not found');
                return;
            }

            const nestedConfig = {
                container_id: containerRef.current.id,
                style_id: import.meta.env.VITE_GEN_SDK_STYLE_ID,
                placement_id: import.meta.env.VITE_GEN_SDK_PLACEMENT_ID,
                api_key: import.meta.env.VITE_API_KEY,
                parent_instance_id: parentWebSdkInstanceId,
                useShadowDOM: false, // Disable shadow DOM for nested instances to avoid conflicts
                // Note: Not passing 'live' config for nested instances
                // Nested instances should go through normal init path, not live path
                // The useShadowDOM: false flag will be respected in both paths
            };

            window.genuin.init(nestedConfig);

            requestAnimationFrame(() => {
                const instanceId = containerRef.current?.getAttribute('data-instance-id') || null;
                if (instanceId) {
                    childInstanceIdRef.current = instanceId;
                }
            });
        } else {
            window.genuin.init({
                container_id: containerRef.current.id,
                style_id: import.meta.env.VITE_GEN_SDK_STYLE_ID,
                placement_id: import.meta.env.VITE_GEN_SDK_PLACEMENT_ID,
                api_key: import.meta.env.VITE_API_KEY,
            });
        }

        isInitializedRef.current = true;

        // Track carousel rendered
        const videoIds = carousalMetadata.video_ids ?? [];
        analytics.trackCarouselRendered({
            video_count: videoIds.length,
            video_ids: videoIds,
            is_nested_in_web_sdk: isWebSdkView,
        });

        // NO CLEANUP - Let React's normal unmounting handle it
        // The web-sdk's own cleanup in react-utils.tsx will handle React roots properly
        // Prevents cascade destroy when dependencies change during re-renders
    }, [
        carousalMetadata,
        isSdkLoaded,
        parentWebSdkInstanceId,
        view,
        analytics,
    ]);

    useEffect(() => {
        if (!isInitializedRef.current) return;
        if (view !== 'web-sdk') return;
        if (!isSdkLoaded) return;
        if (!window.genuin?.onInternal || !window.genuin?.update) return;
        if (!parentWebSdkContainerId) {
            console.warn('[CarousalEmbed] Parent container id missing; cannot forward video selections');
            return;
        }

        const metadataVideoIds = carousalMetadata?.video_ids ?? [];
        if (!metadataVideoIds.length) return;

        const allowedVideoIds = new Set(metadataVideoIds);

        const handleVideoClicked: GenuinEventListener = (event) => {
            const videoId: string | undefined = event?.payload?.videoId;
            if (!videoId || !allowedVideoIds.has(videoId)) {
                return;
            }

            const now = Date.now();
            const lastForwarded = forwardedVideoRef.current;
            if (lastForwarded && lastForwarded.id === videoId && now - lastForwarded.ts < 2000) {
                return;
            }

            // Track carousel video clicked
            const position = metadataVideoIds.indexOf(videoId);
            analytics.trackCarouselVideoClicked({
                video_id: videoId,
                position: position >= 0 ? position : 0,
                total_videos: metadataVideoIds.length,
            });

            console.log('[CarousalEmbed] Forwarding video selection to parent web-sdk', {
                videoId,
                parentContainerId: parentWebSdkContainerId,
                parentInstanceId: parentWebSdkInstanceId,
                parentEmbedId: parentWebSdkEmbedId,
                parentPlacementId: parentWebSdkPlacementId,
                nestedInstanceId: childInstanceIdRef.current,
            });

            const domOctoId = containerRef.current?.getAttribute('data-octo-panel-id') ?? undefined;
            const sourceInstanceId =
                parentOctoPanelId ??
                domOctoId ??
                (childInstanceIdRef.current ?? undefined);

            try {
                const maybePromise = window.genuin.update?.({
                    container_id: parentWebSdkContainerId,
                    start_video_slug: videoId,
                    action: 'play',
                    source_instance_id: sourceInstanceId,
                    embed_id: parentWebSdkEmbedId,
                    placement_id: parentWebSdkPlacementId,
                });

                // Normalize to Promise to handle both sync and async cases uniformly
                Promise.resolve(maybePromise)
                    .then(() => {
                        // Track video forwarded to parent (successful call)
                        analytics.trackVideoForwardedToParent({
                            video_id: videoId,
                            source: 'octo_carousel',
                        });

                        // Only set dedupe ref after successful forward
                        forwardedVideoRef.current = { id: videoId, ts: now };
                    })
                    .catch((error: unknown) => {
                        console.error('[CarousalEmbed] Failed to forward video selection', error);

                        // Track video forward failed
                        analytics.trackVideoForwardFailed({
                            video_id: videoId,
                            error_message: error instanceof Error ? error.message : 'Unknown error',
                        });
                    });
            } catch (error) {
                console.error('[CarousalEmbed] Error while forwarding video selection', error);

                // Track video forward failed
                analytics.trackVideoForwardFailed({
                    video_id: videoId,
                    error_message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        };

        const unsubscribe = window.genuin.onInternal?.('onVideoClicked', handleVideoClicked);

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            } else if (window.genuin?.offInternal) {
                window.genuin.offInternal('onVideoClicked', handleVideoClicked);
            }
        };
    }, [
        carousalMetadata?.video_ids,
        isSdkLoaded,
        parentWebSdkContainerId,
        parentWebSdkEmbedId,
        parentWebSdkInstanceId,
        parentWebSdkPlacementId,
        parentOctoPanelId,
        view,
        analytics,
    ]);

    if (
        isLastMessage &&
        (!carousalMetadata || Object.keys(carousalMetadata).length === 0) &&
        !currentSession?.thinking
    ) {
        return (
            <div className="gai:py-3" ref={containerRef}>
                <div
                    className="gai:mb-2 gai:flex gai:flex-col gai:flex-wrap gai:md:flex-row gai:md:justify-between"
                    style={{ width: '100%' }}
                >
                    <div className="gai:flex gai:flex-col gai:gap-2">
                        <Skeleton className="gai:h-[24px] gai:w-[120px]" />
                        <Skeleton className="gai:hidden gai:h-[18px] gai:w-[150px] gai:md:block" />
                    </div>
                    <Skeleton className="gai:h-[36px] gai:w-[80px] gai:md:self-end" />
                </div>
                <div className="gai:flex gai:gap-2 gai:overflow-auto" style={{ width: '100%' }}>
                    {Array.from({ length: window.innerWidth < 768 ? 4 : 7 }).map((_, index) => (
                        <Skeleton key={index} className="gai:h-[150px] gai:w-full gai:md:h-[250px]" />
                    ))}
                </div>
            </div>
        );
    }

    if (!carousalMetadata) {
        return <></>;
    }

    const videoIds = carousalMetadata?.video_ids?.length ? carousalMetadata.video_ids.join(',') : undefined;
    const pageContext = carousalMetadata?.keywords;
    const dataAttributes: Record<string, string> =
        videoIds !== undefined
            ? { 'data-video-ids': videoIds }
            : pageContext !== undefined
              ? { 'data-page-context': pageContext }
              : {};

    return (
        <div className="gai:flex gai:w-full gai:flex-col gai:pt-3" ref={wrapperRef}>
            <div
                ref={containerRef}
                id={sdkId}
                {...(view === 'web-sdk' && { 'data-web-sdk-nested': 'true' })}
                className="gen-sdk-class gai:h-[300px] gai:w-full gai:md:h-[250px]"
                {...dataAttributes}
                style={{ width: `${containerWidth}px` }}
            />
        </div>
    );
};

export default GenuinEmbed;
