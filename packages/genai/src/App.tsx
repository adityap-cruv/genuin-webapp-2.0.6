import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ArrowCornerLeft from './assets/SvgIcons/ArrowCornerLeft';
import Close from './assets/SvgIcons/Close';
import AppContent from './components/AppContent';
import { WebSDKContent } from './components/WebSDK';
import { AnimatedDialog, AnimatedDialogContent, AnimatedDialogHeader } from './components/ui/animated-dialog';
import { Button } from './components/ui/button';
import { AppProviders } from './context/AppProviders';
import { hideFloater, showFloater } from './styles/floaterStyles';
import type { PendingMessage } from '@/types';

// Container creation utility
const createContainer = (className: string): HTMLElement => {
    let container = document.querySelector(`.${className.split(' ')[0]}`) as HTMLElement;
    if (!container) {
        container = document.createElement('div');
        container.className = className;
        document.body.appendChild(container);
    }
    return container;
};

// Generic mount function
const createMountFunction = (view: 'floater' | 'dialog', containerClass: string) => {
    return async (props: AppProps): Promise<() => void> => {
        const container = createContainer(containerClass);
        const root = createRoot(container);

        const cleanup = () => {
            root.unmount();
            if (container.parentNode) {
                container.parentNode.removeChild(container);
                window.GenAISDK.forceOpen = true;
            }
        };

        root.render(<App {...props} view={view} onClose={cleanup} />);
        return cleanup;
    };
};

interface AppProps {
    userId: string;
    brandId: number;
    sessionId?: string;
    view?: 'page' | 'floater' | 'dialog' | 'web-sdk';
    renderMode?: 'compact' | 'full';
    onClose?: () => void;
    pendingMessages?: Array<PendingMessage>;
    userEmail?: string;
    userUUID?: string;
    isMaya?: boolean;
    parentWebSdkInstanceId?: string;
    parentWebSdkContainerId?: string;
    parentWebSdkEmbedId?: string;
    parentWebSdkPlacementId?: string;
    parentOctoPanelId?: string;
    videoId?: string;
    // Integration fields for embed/placement context
    integrationType?: 'embed' | 'placement';
    integrationId?: string;
    contentOrder?: string[];
}

function App({
    userId,
    brandId,
    sessionId,
    view = 'page',
    renderMode,
    onClose,
    pendingMessages,
    userEmail,
    userUUID,
    isMaya,
    parentWebSdkInstanceId,
    parentWebSdkContainerId,
    parentWebSdkEmbedId,
    parentWebSdkPlacementId,
    parentOctoPanelId,
    videoId,
    integrationType,
    integrationId,
    contentOrder,
}: AppProps) {
    const [open, setOpen] = useState(true);
    // const [isCollapsed, setIsCollapsed] = useState(false);
    const currentSessionId = sessionId || undefined;

    // Clean up player coordinator and inject custom styles on component unmount
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
      .gen-sdk-expand-view { z-index: 100000 !important; }
    `;
        document.head.append(styleElement);

        return () => {
            styleElement.remove();
        };
    }, []);
    useEffect(() => {
        const handleOpenDialog = () => {
            setOpen(true);
        };

        window.addEventListener('genai:openDialog', handleOpenDialog);

        return () => {
            window.removeEventListener('genai:openDialog', handleOpenDialog);
        };
    }, []);

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            // setIsCollapsed(true);
            setOpen(false);
            showFloater();
        }
    };

    // const handleReopen = () => {
    //     setIsCollapsed(false);
    //     setOpen(true);
    // };

    const handleActualClose = () => {
        setOpen(false);
        setTimeout(() => {
            showFloater();
            onClose?.();
        }, 300);
    };

    // Hide original floater when component mounts (for dialog and floater views)
    useEffect(() => {
        if (view !== 'page') {
            hideFloater();
            return () => showFloater();
        }
    }, [view]);

    const renderContent = () => (
        <AppProviders
            userId={userId}
            brandId={brandId}
            currentSessionId={currentSessionId}
            view={view}
            webSdkRenderMode={renderMode}
            pendingMessages={pendingMessages}
            userEmail={userEmail}
            userUUID={userUUID}
            isMaya={isMaya}
            parentWebSdkInstanceId={parentWebSdkInstanceId}
            parentWebSdkContainerId={parentWebSdkContainerId}
            parentWebSdkEmbedId={parentWebSdkEmbedId}
            parentWebSdkPlacementId={parentWebSdkPlacementId}
            parentOctoPanelId={parentOctoPanelId}
            videoId={videoId}
            integrationType={integrationType}
            integrationId={integrationId}
            contentOrder={contentOrder}
        >
            <AppContent />
        </AppProviders>
    );

    const renderWebSDKContent = () => (
        <AppProviders
            userId={userId}
            brandId={brandId}
            currentSessionId={currentSessionId}
            view={view}
            webSdkRenderMode={renderMode}
            pendingMessages={pendingMessages}
            userEmail={userEmail}
            userUUID={userUUID}
            isMaya={isMaya}
            parentWebSdkInstanceId={parentWebSdkInstanceId}
            parentWebSdkContainerId={parentWebSdkContainerId}
            parentWebSdkEmbedId={parentWebSdkEmbedId}
            parentWebSdkPlacementId={parentWebSdkPlacementId}
            parentOctoPanelId={parentOctoPanelId}
            videoId={videoId}
            integrationType={integrationType}
            integrationId={integrationId}
            contentOrder={contentOrder}
        >
            <WebSDKContent />
        </AppProviders>
    );

    // Web-SDK view - render web-sdk specific content
    if (view === 'web-sdk') {
        return renderWebSDKContent();
    }

    // Page view - render content with proper stacking context
    if (view === 'page') {
        return renderContent();
    }

    // useEffect(() => {
    //     console.log('isCollapsed', isCollapsed);
    //     console.log('view', view);
    //     if(view === 'floater') {
    //         const floater = createFloaterElement();
    //         console.log("adding event listener")
    //         floater.addEventListener('click', () => {
    //             console.log('click');
    //             handleReopen();
    //         });
    //     }
    // }, []);
    return (
        <AppProviders
            userId={userId}
            brandId={brandId}
            currentSessionId={currentSessionId}
            view={view}
            webSdkRenderMode={renderMode}
            pendingMessages={pendingMessages}
            userEmail={userEmail}
            userUUID={userUUID}
            isMaya={isMaya}
            parentWebSdkInstanceId={parentWebSdkInstanceId}
            parentWebSdkContainerId={parentWebSdkContainerId}
            parentWebSdkEmbedId={parentWebSdkEmbedId}
            parentWebSdkPlacementId={parentWebSdkPlacementId}
            parentOctoPanelId={parentOctoPanelId}
            videoId={videoId}
            integrationType={integrationType}
            integrationId={integrationId}
        >
            <AnimatedDialog open={open} onOpenChange={handleOpenChange}>
                <AnimatedDialogContent
                    className='gai:flex gai:h-full gai:max-w-none gai:flex-col gai:gap-0 gai:overflow-hidden gai:rounded-2xl gai:border-none gai:p-0'
                    showCloseButton={false}
                >
                    <AnimatedDialogHeader className='gai:flex gai:flex-shrink-0 gai:flex-row gai:items-center gai:justify-between gai:bg-primary-50 gai:p-4'>
                        <Button
                            onClick={() => handleOpenChange(false)}
                            variant='ghost'
                            size='icon'
                            className='gai:h-9 gai:w-9 gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-lg gai:border gai:border-primary-100 gai:text-secondary-gray-700 gai:transition-colors gai:hover:bg-none gai:hover:text-secondary-gray-900'
                            title='Minimize dialog'
                        >
                            <ArrowCornerLeft />
                        </Button>
                        <Button
                            onClick={handleActualClose}
                            variant='ghost'
                            size='icon'
                            className='gai:flex gai:h-9 gai:w-9 gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-lg gai:border gai:border-primary-100 gai:text-secondary-gray-700 gai:transition-colors gai:hover:text-secondary-gray-900'
                            title='Close dialog'
                        >
                            <Close />
                        </Button>
                    </AnimatedDialogHeader>
                    <div className='gai:flex-1 gai:overflow-hidden'>
                        <AppContent />
                    </div>
                </AnimatedDialogContent>
            </AnimatedDialog>
        </AppProviders>
    );
}

export async function mount(container: HTMLElement, props: AppProps): Promise<() => void> {
    const root = createRoot(container);
    root.render(<App {...props} />);
    return () => root.unmount();
}

// Create specialized mount functions using the generic utility
export const mountWithFloater = createMountFunction('floater', 'genai-sdk-floater-container genai-sdk-container');
export const mountWithDialog = createMountFunction('dialog', 'genai-sdk-container');

export default App;
