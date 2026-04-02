import { useCallback, useEffect, useRef, useState } from 'react';
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
    const { view } = useAgentsContext();
    const containerRef = useRef<HTMLDivElement>(null);
    const [adServed, setAdServed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const processedRef = useRef(false);

    const isWebSdkView = view === 'web-sdk';

    const processAd = useCallback(async (currentAiResponse: string) => {
        if (!window.koah || !containerRef.current || !userMessage || processedRef.current) {
            setIsLoading(false);
            return;
        }

        processedRef.current = true;

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
                },
                onNoFill: () => {
                    setAdServed(false);
                    setIsLoading(false);
                },
            });

            if (!served) {
                setAdServed(false);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('[KoahAdWidget] Failed to process ad', error);
            setAdServed(false);
            setIsLoading(false);
        }
    }, [userMessage, messageId]);

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
        }, 5000);

        return () => {
            clearInterval(checkInterval);
            clearTimeout(timeout);
        };
    }, [isWebSdkView, userMessage, messageId, processAd, aiResponse]);

    // Don't render if not in web-sdk view or no user message
    if (!isWebSdkView || !userMessage) {
        return null;
    }

    // Don't render container if loading finished and no ad was served
    if (!isLoading && !adServed) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className='adsbykoah gai:w-full gai:text-black'
        />
    );
};

export default KoahAdWidget;
