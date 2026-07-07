import { Share } from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useRudderEvents } from '@/adapters/analytics/useRudderAnalytics';
import { eventBus } from '@/core/events/EventBus';
import { EVENTS } from '@/core/events/eventRegistry';
import { useAgentContext } from '@/stores/agent/context';
import { useSessionContext } from '@/stores/session/context';
import { useUIContext } from '@/stores/ui/context';

import NewChat from '../assets/SvgIcons/NewChat';

import AgentsDropdown from './AgentsDropdown';
import AgentsSection from './AgentsSection';
import MessageInput from './MessageInput';
import Objectives from './Objectives';
import SideBar from './Sidebar';
import ModalTitle from './Title';
import { Button } from './ui/button';
import { NewChatDialog } from './ui/new-chat-dialog';
import { Toaster } from './ui/sonner';
import Spinner from './ui/spinner';
const Chat = lazy(() => import('./Chat'));
const AgentIntro = lazy(() => import('./AgentIntro'));

export default function AppContent() {
    const { enteredInChatMode, currentSessionId, ipInfo } = useSessionContext();
    const { currentAgent, onBoardingAgents } = useAgentContext();
    const { isSidebarCollapsed, handleNewChat, brand_id, view } = useUIContext();

    const [hasExpandedVideo, setHasExpandedVideo] = useState(false);

    const { track } = useRudderEvents();

    useEffect(() => {
        if (ipInfo && view) {
            const payload = {
                ipInfo,
                view,
            };
            track('genai:visited', payload);
        }
    }, [ipInfo, view]);

    useEffect(() => {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    const hasExpandedElement = document.querySelector('.gen-sdk-expand-open');
                    const hasDialOpenElement = document.querySelector('.gen-sdk-dialog-open');
                    setHasExpandedVideo(!!hasExpandedElement || !!hasDialOpenElement);
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Toaster />

            <div
                className={`gai:flex gai:h-full gai:w-full gai:overflow-hidden gai:font-inter ${enteredInChatMode ? 'gai:bg-utility-white' : 'gai:bg-primary-50'}`}
            >
                {/* Sidebar Section - Only show when not collapsed */}
                {!isSidebarCollapsed && brand_id !== -1 && (
                    <div className='gai:hidden gai:h-full gai:w-[280px] gai:border-r gai:border-primary-100 gai:md:block'>
                        <SideBar />
                    </div>
                )}

                {/* Main Content Area */}
                <div className='gai:relative gai:flex gai:h-full gai:min-w-0 gai:flex-1 gai:flex-col'>
                    {/* Header with Collapsed Sidebar and AgentsDropdown */}
                    <div
                        className={`gai:top-0 gai:right-0 gai:left-0 gai:flex gai:items-center ${
                            enteredInChatMode
                                ? 'gai:justify-between gai:bg-white'
                                : 'gai:justify-center gai:bg-primary-50 gai:md:justify-start'
                        } gai:px-4 gai:py-2`}
                    >
                        <div className='gai:flex gai:gap-2'>
                            {isSidebarCollapsed && (
                                <>
                                    {brand_id !== -1 && (
                                        <div className='gai:hidden gai:md:block'>
                                            <SideBar />
                                        </div>
                                    )}
                                    {enteredInChatMode && (
                                        <>
                                            {brand_id === -1 ? (
                                                <NewChatDialog
                                                    currentSessionId={currentSessionId}
                                                    onNewChat={handleNewChat}
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => {
                                                        handleNewChat();
                                                    }}
                                                    className='gai:flex gai:h-10 gai:w-10 gai:cursor-pointer gai:items-center gai:justify-center gai:rounded-md gai:text-secondary-gray-700 gai:hover:bg-primary-100 gai:hover:text-secondary-gray-900'
                                                    title='New chat'
                                                >
                                                    <NewChat />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <AgentsDropdown />
                        </div>
                        {enteredInChatMode && currentSessionId && (
                            <div className='gai:flex'>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='gai:cursor-pointer gai:hover:bg-primary-50'
                                    onClick={() => {
                                        if (ipInfo) {
                                            track('genai:session_shared', {
                                                ipInfo,
                                                session_id: currentSessionId,
                                            });
                                        }
                                        eventBus.emit(EVENTS.SHARE_LINK, {
                                            sessionId: currentSessionId,
                                        });
                                        toast.success('Copied to clipboard');
                                    }}
                                >
                                    <Share className='gai:text-secondary-gray-700' />
                                </Button>
                            </div>
                        )}
                    </div>

                    {enteredInChatMode ? (
                        <>
                            {/* Chat Mode Content */}
                            <div
                                className={`gai:scrollbar-hide gai:flex-1 ${hasExpandedVideo ? '' : 'gai:overflow-y-auto'}`}
                            >
                                <div className='gai:mx-auto gai:flex gai:min-h-full gai:w-full gai:justify-center gai:px-4 gai:md:w-3/4 gai:md:px-0'>
                                    {/* eslint-disable-next-line no-restricted-syntax -- genai does not depend on @genuin/components (SafeSuspense); bare Suspense is intentional here. */}
                                    <Suspense
                                        fallback={
                                            <div className='gai:flex gai:w-full gai:items-center gai:justify-center gai:pb-44'>
                                                <Spinner size='md' color='primary' />
                                            </div>
                                        }
                                    >
                                        {currentSessionId ? <Chat /> : <AgentIntro />}
                                    </Suspense>
                                </div>
                            </div>
                            {/* Chat Mode Footer */}
                            <div
                                className={`gai:right-0 gai:bottom-0 gai:mt-2 gai:bg-white gai:py-2 gai:md:px-0 ${
                                    !isSidebarCollapsed && brand_id !== -1 ? 'gai:left-0' : 'gai:left-0'
                                }`}
                            >
                                <div className='gai:mx-auto gai:w-full gai:md:w-3/4'>
                                    {!onBoardingAgents.includes(currentAgent) && <MessageInput />}
                                    <span className='gai:mt-2 gai:block gai:text-center gai:font-body-2-med gai:text-secondary-gray-600'>
                                        gAI can make mistakes. Check important info.
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Non-Chat Mode Content
                        <div className='gai:scrollbar-hide gai:flex-1 gai:overflow-y-auto'>
                            <div className='gai:mx-auto gai:w-full gai:px-4 gai:pt-6 gai:pb-10 gai:md:w-3/4 gai:md:px-0'>
                                <div className='gai:flex gai:flex-col gai:gap-8'>
                                    <ModalTitle />
                                    <AgentsSection />
                                    <MessageInput />
                                    <Objectives />
                                </div>
                            </div>
                            <div className='gai:flex gai:flex-col gai:items-center gai:p-4 gai:text-center gai:font-body-2-med gai:text-secondary-gray-600'>
                                By messaging GenuinAI, you agree to our Terms and have read our Privacy Policy.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
