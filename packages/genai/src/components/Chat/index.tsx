import { useAgentsContext } from '@/context/app/context';
import { useEffect, useRef, useState, useMemo } from 'react';
import SDKLoader from '../CarousalLoader';
import Spinner from '../ui/spinner';
import Item from './MessageItem';

const Chat = () => {
    const {
        sessions,
        currentSessionId,
        currentAgent,
        setFeedback,
        onBoardingAgents,
        handleSendMessage,
        agents,
        view,
    } = useAgentsContext();
    const [sdkLoaded, setSdkLoaded] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevChatLengthRef = useRef<number>(0);
    const prevThinkingRef = useRef<boolean>(false);

    const currentSession = useMemo(
        () => sessions.find(session => session.id === currentSessionId),
        [sessions, currentSessionId]
    );

    useEffect(() => {
        const eventsLength = currentSession?.chat?.length ?? 0;
        const prevEventsLength = prevChatLengthRef.current;
        const thinking = currentSession?.thinking ?? false;
        const prevThinking = prevThinkingRef.current;

        const hasNewEvents = eventsLength > prevEventsLength;
        const thinkingJustStarted = !prevThinking && thinking;

        if ((hasNewEvents || thinkingJustStarted) && eventsLength > 0) {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
            });
        }

        prevChatLengthRef.current = eventsLength;
        prevThinkingRef.current = thinking;
    }, [currentSession?.chat, currentSession?.thinking]);

    if (!currentSession || currentSession?.status === 'fetching' || currentSession?.status === 'idle') {
        return (
            <div className='gai:flex gai:w-full gai:items-center gai:justify-center'>
                <div className='gai:flex gai:h-10 gai:w-10 gai:items-center gai:justify-center'>
                    <Spinner size='md' />
                </div>
            </div>
        );
    }
    const events = currentSession?.chat || [];
    const lastEventId = events.length > 0 ? events[events.length - 1].id : null;
    const sessionThinking = currentSession?.thinking;
    return (
        <>
            <SDKLoader onLoad={() => setSdkLoaded(true)} />
            <div className='gai:mx-auto gai:flex gai:w-full gai:flex-col gai:gap-6 gai:pb-6'>
                {events.map(event => {
                    const isLastEvent = event.id === lastEventId;
                    return (
                        <Item
                            key={event.id}
                            event={event}
                            messageType={event.role}
                            currentSessionId={currentSessionId}
                            currentAgent={currentAgent}
                            agents={agents}
                            onBoardingAgents={onBoardingAgents}
                            setFeedback={setFeedback}
                            isLastMessage={isLastEvent}
                            sessionThinking={sessionThinking}
                            isSdkLoaded={sdkLoaded}
                            handleSendMessage={handleSendMessage}
                            view={view}
                        />
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </>
    );
};

export default Chat;
