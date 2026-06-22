import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        koah?: {
            process: (
                userMessage: string,
                aiResponse: string,
                adType: 'suffix' | 'prefix' | 'followup' | 'inline',
                options?: {
                    target?: HTMLElement;
                    messageId?: string;
                    slotId?: string;
                    signal?: AbortSignal;
                    onFill?: () => void;
                    onNoFill?: () => void;
                }
            ) => Promise<boolean>;
            theme?: {
                colorScheme?: 'light' | 'dark';
                presentationMode?: 'borderless' | 'card';
                accentColor?: string;
                fontFamily?: string;
                maxWidth?: string;
                hideCta?: boolean;
            };
        };
        koah_init?: {
            theme?: {
                colorScheme?: 'light' | 'dark';
                presentationMode?: 'borderless' | 'card';
                accentColor?: string;
                fontFamily?: string;
                maxWidth?: string;
                hideCta?: boolean;
            };
        };
    }
}

type KoahSDKLoaderProps = {
    onLoad?: () => void;
};

const KoahSDKLoader = ({ onLoad }: KoahSDKLoaderProps) => {
    const loadedRef = useRef(false);

    useEffect(() => {
        const publisherId = import.meta.env.VITE_GENAI_KOAH_PUBLISHER_ID;

        if (!publisherId) {
            console.warn('[KoahSDKLoader] VITE_GENAI_KOAH_PUBLISHER_ID is not defined');
            onLoad?.();
            return;
        }

        // Check if SDK is already loaded
        if (window.koah) {
            loadedRef.current = true;
            onLoad?.();
            return;
        }

        // Prevent double loading
        if (loadedRef.current) {
            return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector(`script[src*="koah.ai"]`);
        if (existingScript) {
            // Script exists, wait for it to load
            const checkKoahLoaded = setInterval(() => {
                if (window.koah) {
                    clearInterval(checkKoahLoaded);
                    loadedRef.current = true;
                    onLoad?.();
                }
            }, 100);

            // Cleanup interval after 10 seconds
            const timeoutId = setTimeout(() => clearInterval(checkKoahLoaded), 10000);
            return () => {
                clearInterval(checkKoahLoaded);
                clearTimeout(timeoutId);
            };
        }

        // Set up theme before SDK loads
        window.koah_init = window.koah_init || {};
        window.koah_init.theme = {
            colorScheme: 'light',
            presentationMode: 'card',
            fontFamily: 'inherit',
            maxWidth: '100%',
        };

        const script = document.createElement('script');
        script.src = `https://app.koah.ai/js?token=${publisherId}`;
        script.async = true;

        script.onload = () => {
            loadedRef.current = true;
            onLoad?.();
        };

        script.onerror = () => {
            console.error('[KoahSDKLoader] Failed to load Koah SDK');
        };

        document.head.appendChild(script);

        return () => {
            // We don't remove the script on unmount as other components may need it
        };
    }, [onLoad]);

    return null;
};

export default KoahSDKLoader;
