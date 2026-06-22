import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';

import { useAgentContext } from '@/stores/agent/context';
import { useChatContext } from '@/stores/chat/context';
import { useSessionContext } from '@/stores/session/context';
import { useUIContext } from '@/stores/ui/context';

import SDKLoader from '../CarousalLoader';
import Spinner from '../ui/spinner';

import KoahSDKLoader from './KoahSDKLoader';
import Item from './MessageItem';

interface ChatProps {
    scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

const Chat = ({ scrollContainerRef }: ChatProps) => {
    const { sessions, currentSessionId, setFeedback } = useSessionContext();
    const { currentAgent, onBoardingAgents, filteredAgents: agents } = useAgentContext();
    const { handleSendMessage } = useChatContext();
    const { view } = useUIContext();
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [koahSdkLoaded, setKoahSdkLoaded] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null);
    const lastScrolledUserIdRef = useRef<string | null>(null);
    // Trailing-spacer height that lets the latest user message pin to the top of the
    // viewport (ChatGPT-style) while the agent reply streams in. Shrinks to 0 as the
    // reply grows past the viewport, so no permanent gap is left behind.
    const [spacerHeight, setSpacerHeight] = useState(0);

    const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId), [sessions, currentSessionId]);

    const events = useMemo(() => currentSession?.chat ?? [], [currentSession]);
    const lastUserEvent = useMemo(() => {
        for (let i = events.length - 1; i >= 0; i--) {
            const e = events[i];
            if (e?.role === 'user') return e;
        }
        return null;
    }, [events]);
    const lastUserId = lastUserEvent?.id ?? null;

    useEffect(() => {
        if (!lastUserId) return;
        if (lastScrolledUserIdRef.current === lastUserId) return;
        const root = listRef.current;
        if (!root) return;
        const el = root.querySelector<HTMLElement>(`[data-mid="${lastUserId}"]`);
        if (!el) return;
        lastScrolledUserIdRef.current = lastUserId;
        // Double rAF: let layout settle (e.g. the compact→full expand transition and
        // the freshly-appended message) before measuring, so the scroll target is correct.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const container = scrollContainerRef?.current;
                if (!container) return;
                // Measure the element relative to the scroll container via bounding rects —
                // offsetTop is relative to offsetParent, which is not guaranteed to be the
                // container, so it can land in the wrong coordinate space and fail to scroll.
                const containerRect = container.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const top = container.scrollTop + (elRect.top - containerRect.top) - 8;
                container.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }, [lastUserId, scrollContainerRef]);

    // Keep a trailing spacer just tall enough for the latest user message to reach the
    // top of the viewport, so it stays pinned while the reply streams. Recomputes on
    // every content change (streaming) and on container resize, shrinking as the reply
    // fills the viewport. Reads the spacer's own rendered height to converge without a loop.
    useLayoutEffect(() => {
        const recompute = () => {
            const container = scrollContainerRef?.current;
            const list = listRef.current;
            if (!container || !list || !lastUserId) {
                setSpacerHeight(prev => (prev === 0 ? prev : 0));
                return;
            }
            const el = list.querySelector<HTMLElement>(`[data-mid="${lastUserId}"]`);
            if (!el) return;
            const currentSpacer = spacerRef.current?.offsetHeight ?? 0;
            const userTopWithinList = el.getBoundingClientRect().top - list.getBoundingClientRect().top;
            const contentBelowUser = list.scrollHeight - currentSpacer - userTopWithinList;
            const next = Math.max(0, container.clientHeight - contentBelowUser);
            setSpacerHeight(prev => (Math.abs(prev - next) > 1 ? next : prev));
        };

        recompute();

        const container = scrollContainerRef?.current;
        if (!container || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(recompute);
        observer.observe(container);
        return () => observer.disconnect();
    }, [events, lastUserId, scrollContainerRef]);

    if (!currentSession || currentSession.status === 'fetching' || currentSession.status === 'idle') {
        return (
            <div className='gai:flex gai:w-full gai:items-center gai:justify-center'>
                <div className='gai:flex gai:h-10 gai:w-10 gai:items-center gai:justify-center'>
                    <Spinner size='md' />
                </div>
            </div>
        );
    }

    const lastEventId = events.at(-1)?.id ?? null;
    const sessionThinking = currentSession.thinking;
    const thinkingSteps = currentSession.thinkingSteps ?? [];

    return (
        <>
            <SDKLoader onLoad={() => setSdkLoaded(true)} />
            <KoahSDKLoader onLoad={() => setKoahSdkLoaded(true)} />
            <div ref={listRef} className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
                {events.map(event => (
                    <Item
                        key={event.id}
                        event={event}
                        allEvents={events}
                        messageType={event.role}
                        currentSessionId={currentSessionId}
                        currentAgent={currentAgent}
                        agents={agents}
                        onBoardingAgents={onBoardingAgents}
                        setFeedback={setFeedback}
                        isLastMessage={event.id === lastEventId}
                        sessionThinking={sessionThinking}
                        isSdkLoaded={sdkLoaded}
                        isKoahSdkLoaded={koahSdkLoaded}
                        handleSendMessage={handleSendMessage}
                        view={view}
                        thinkingSteps={thinkingSteps}
                    />
                ))}
                {/* Dynamic spacer — lets the latest user message pin to the top while the
                    reply streams; height shrinks to 0 once the reply fills the viewport. */}
                <div ref={spacerRef} aria-hidden style={{ height: spacerHeight }} />
                <div ref={messagesEndRef} />
            </div>
        </>
    );
};

export default Chat;
