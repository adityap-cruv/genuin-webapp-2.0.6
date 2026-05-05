import { useCallback, useEffect, useRef, useState } from 'react';

import { useOctoAnalytics } from '@/context/analytics';
import { useAgentsContext } from '@/context/app/context';

type KoahAdWidgetProps = {
    userMessage: string | null;
    aiResponse: string;
    messageId: string;
};

// Copy Koah's native styles into shadow root so they can apply
const injectKoahStyles = (container: HTMLElement): void => {
    const rootNode = container.getRootNode();

    // Only need to handle shadow root case - styles in document.head work normally outside shadow DOM
    if (!(rootNode instanceof ShadowRoot)) return;

    const shadowRoot = rootNode;

    // Check if styles already exist in shadow root
    const existingStyle = shadowRoot.querySelector('#koah-theme-styles-shadow');
    if (existingStyle) return;

    // Copy Koah's own theme styles from document.head into shadow root
    const koahThemeStyles = document.head.querySelector('#koah-preact-snippet-styles');
    if (koahThemeStyles) {
        const clonedStyles = koahThemeStyles.cloneNode(true) as HTMLStyleElement;
        clonedStyles.id = 'koah-theme-styles-shadow';
        shadowRoot.insertBefore(clonedStyles, shadowRoot.firstChild);
    }
};

const KoahAdWidget = ({ userMessage, aiResponse, messageId }: KoahAdWidgetProps) => {
    const { view, currentSessionId } = useAgentsContext();
    const { analytics } = useOctoAnalytics();
    const containerRef = useRef<HTMLDivElement>(null);
    const [adServed, setAdServed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const processedRef = useRef(false);
    const processingStartTime = useRef<number>(0);

    const isWebSdkView = view === 'web-sdk';

    const processAd = useCallback(
        async (currentAiResponse: string) => {
            if (!window.koah || !containerRef.current || !userMessage || processedRef.current) {
                setIsLoading(false);
                return;
            }

            processedRef.current = true;
            processingStartTime.current = Date.now();

            // Track: Ad processing started
            analytics.trackKoahAdProcessingStarted({
                message_id: messageId,
                user_message: userMessage,
                session_id: currentSessionId || undefined,
            });

            try {
                const served = await window.koah.process(userMessage, currentAiResponse, 'suffix', {
                    target: containerRef.current,
                    messageId: `koah-${messageId}`,
                    onFill: () => {
                        if (containerRef.current) {
                            injectKoahStyles(containerRef.current);
                        }
                        setAdServed(true);
                        setIsLoading(false);

                        // Track: Ad served successfully
                        const processingTime = Date.now() - processingStartTime.current;
                        analytics.trackKoahAdServed({
                            message_id: messageId,
                            user_message: userMessage,
                            processing_time_ms: processingTime,
                            session_id: currentSessionId || undefined,
                        });
                    },
                    onNoFill: () => {
                        setAdServed(false);
                        setIsLoading(false);

                        // Track: No ad available
                        analytics.trackKoahAdNoFill({
                            message_id: messageId,
                            user_message: userMessage,
                            reason: 'onNoFill callback triggered',
                            session_id: currentSessionId || undefined,
                        });
                    },
                });

                if (!served) {
                    setAdServed(false);
                    setIsLoading(false);

                    // Track: No ad served (returned false)
                    analytics.trackKoahAdNoFill({
                        message_id: messageId,
                        user_message: userMessage,
                        reason: 'koah.process returned false',
                        session_id: currentSessionId || undefined,
                    });
                }
            } catch (error) {
                console.error('[KoahAdWidget] Failed to process ad', error);
                setAdServed(false);
                setIsLoading(false);

                // Track: Ad processing failed
                analytics.trackKoahAdProcessingFailed({
                    message_id: messageId,
                    error_message: error instanceof Error ? error.message : String(error),
                    error_stack: error instanceof Error ? error.stack : undefined,
                    session_id: currentSessionId || undefined,
                });
            }
        },
        [userMessage, messageId, analytics, currentSessionId]
    );

    // Track ad clicks
    useEffect(() => {
        if (!adServed || !containerRef.current) return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if click is within the Koah ad container
            if (containerRef.current?.contains(target)) {
                // Track: Ad clicked
                analytics.trackKoahAdClicked({
                    message_id: messageId,
                    user_message: userMessage || '',
                    ad_element: target.tagName.toLowerCase(),
                    session_id: currentSessionId || undefined,
                });
            }
        };

        // Add click listener to container
        const container = containerRef.current;
        container.addEventListener('click', handleClick);

        return () => {
            container.removeEventListener('click', handleClick);
        };
    }, [adServed, messageId, userMessage, analytics, currentSessionId]);

    useEffect(() => {
        // Reset state when messageId changes
        processedRef.current = false;
        setAdServed(false);
        setIsLoading(true);

        if (!isWebSdkView || !userMessage) {
            setIsLoading(false);
            return;
        }

        // Check if Koah SDK is loaded
        if (window.koah) {
            processAd(aiResponse);
            return;
        }

        // Wait for SDK to load
        const checkInterval = setInterval(() => {
            if (window.koah) {
                clearInterval(checkInterval);
                processAd(aiResponse);
            }
        }, 100);

        // Timeout after 5 seconds
        const timeout = setTimeout(() => {
            clearInterval(checkInterval);
            setIsLoading(false);

            // Track: SDK load timeout
            if (!window.koah) {
                analytics.trackKoahSdkLoadTimeout({
                    message_id: messageId,
                    timeout_ms: 5000,
                    session_id: currentSessionId || undefined,
                });
            }
        }, 5000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
        };
    }, [isWebSdkView, userMessage, messageId, processAd, aiResponse, analytics, currentSessionId]);

    // Don't render if not in web-sdk view or no user message
    if (!isWebSdkView || !userMessage) {
        return null;
    }

    // Don't render container if loading finished and no ad was served
    if (!isLoading && !adServed) {
        return null;
    }

    return <div ref={containerRef} className='adsbykoah gai:w-full gai:text-black' />;
};

export default KoahAdWidget;
