import { useCallback, useState } from 'react';

export interface MessagePayload {
    session_id: string;
    query: string;
    agent_id: string | null;
    s3_keys: string[];
    chat_id?: string | null;
    regeneration?: boolean;
    metadata?: Record<string, any>;
}

interface UseWebSocketManagerParams {
    brandId: number;
    userId: string;
    onMessage: (data: any, wsInstance: WebSocket | null) => void;
    onError: (sessionId: string | null | undefined, error: string | any) => void;
}

interface UseWebSocketManagerResult {
    wsConnection: WebSocket | null;
    createWebSocketConnection: () => WebSocket;
    closeWebSocketConnection: () => void;
    enqueueMessage: (payload: MessagePayload, wsInstance?: WebSocket | null) => void;
}

export const useWebSocketManager = ({
    brandId,
    userId,
    onMessage,
    onError,
}: UseWebSocketManagerParams): UseWebSocketManagerResult => {
    const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
    const [, setMessageQueue] = useState<MessagePayload[]>([]);

    const flushQueue = useCallback((ws: WebSocket) => {
        setMessageQueue(currentQueue => {
            currentQueue.forEach(payload => {
                ws.send(JSON.stringify(payload));
            });
            return [];
        });
    }, []);

    const closeWebSocketConnection = useCallback(() => {
        if (wsConnection) {
            wsConnection.onclose = null;
            wsConnection.onmessage = null;
            wsConnection.onerror = null;
            wsConnection.onopen = null;
            wsConnection.close();
            setWsConnection(null);
            console.log('WebSocket connection manually closed');
        }
    }, [wsConnection]);

    const createWebSocketConnection = useCallback(() => {
        if (wsConnection) {
            if (wsConnection.readyState === WebSocket.OPEN || wsConnection.readyState === WebSocket.CONNECTING) {
                return wsConnection;
            }

            wsConnection.onclose = null;
            wsConnection.onmessage = null;
            wsConnection.onerror = null;
            wsConnection.onopen = null;
        }

        const wsUrl = import.meta.env.VITE_API_URL?.replace('http', 'ws') + '/agents';
        const wsEndpoint = `${wsUrl}/chat/${brandId}/${userId}`;

        console.log('Creating new WebSocket connection to:', wsEndpoint);
        const ws = new WebSocket(wsEndpoint);
        setWsConnection(ws);

        ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                if (data.error) {
                    onError(data.session_id, data.error);
                    return;
                }
                onMessage(data, ws);
            } catch {
                // swallow parsing errors
            }
        };

        ws.onopen = () => {
            flushQueue(ws);
        };

        ws.onclose = event => {
            console.log(`WebSocket connection closed with code: ${event.code}, reason: ${event.reason}`);
            setWsConnection(null);
        };

        ws.onerror = event => {
            console.error('WebSocket error:', event);
        };

        return ws;
    }, [wsConnection, brandId, userId, onError, onMessage, flushQueue]);

    const enqueueMessage = useCallback(
        (payload: MessagePayload, wsInstance?: WebSocket | null) => {
            const socket = wsInstance || wsConnection;
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(payload));
                return;
            }

            setMessageQueue(prev => [...prev, payload]);
        },
        [wsConnection]
    );

    return {
        wsConnection,
        createWebSocketConnection,
        closeWebSocketConnection,
        enqueueMessage,
    };
};
