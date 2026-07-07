import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { startChatSession } from '@/services/api';
import { readStream } from '@/services/stream/StreamReader';

import { useSSEHandler } from './useSSEHandler';

// vi.mock is hoisted by Vitest, so it still applies to the imports above.
vi.mock('@/services/api', () => ({
  getChatStreamUrl: (id: string) => `/stream/${id}`,
  startChatSession: vi.fn(),
}));

vi.mock('@/services/stream/StreamReader', () => ({
  readStream: vi.fn(),
}));

const mockStartChatSession = startChatSession as Mock;
const mockReadStream = readStream as Mock;

describe('useSSEHandler', () => {
  const onMessage = vi.fn();
  const onError = vi.fn();
  const onSessionCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: new ReadableStream(),
    });
    mockReadStream.mockResolvedValue({ isCompleted: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('sendSSEMessage', () => {
    it('calls startChatSession with the correct payload', async () => {
      mockStartChatSession.mockResolvedValue({
        data: { session_id: 'real-1', user_message_id: 'um-1' },
        message: '',
      });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      await act(async () => {
        await result.current.sendSSEMessage({
          brand_id: 42,
          message: 'Hello',
          agent_id: 'agent-1',
          agent_type: 'default',
          session_id: null,
          user_id: 'user-1',
          s3_keys: [],
          temp_session_id: 'temp-1',
        });
      });

      expect(mockStartChatSession).toHaveBeenCalledWith(
        expect.objectContaining({ brand_id: 42, message: 'Hello', agent_id: 'agent-1' })
      );
    });

    it('calls onSessionCreated when temp_session_id resolves to real id', async () => {
      mockStartChatSession.mockResolvedValue({
        data: { session_id: 'real-1', user_message_id: 'um-1' },
        message: '',
      });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      await act(async () => {
        await result.current.sendSSEMessage({
          brand_id: 1,
          message: 'hi',
          agent_id: 'a',
          agent_type: 'default',
          session_id: null,
          user_id: 'u',
          s3_keys: [],
          temp_session_id: 'temp-1',
        });
      });

      expect(onSessionCreated).toHaveBeenCalledWith('temp-1', 'real-1');
    });

    it('calls onError when startChatSession throws a non-abort error', async () => {
      mockStartChatSession.mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      await act(async () => {
        await result.current.sendSSEMessage({
          brand_id: 1,
          message: 'hi',
          agent_id: 'a',
          agent_type: 'default',
          session_id: 'session-1',
          user_id: 'u',
          s3_keys: [],
        });
      });

      expect(onError).toHaveBeenCalledWith('session-1', 'Network failure');
    });
  });

  describe('cancelStream', () => {
    it('aborts in-flight request for the given sessionId', async () => {
      let capturedSignal: AbortSignal | undefined;
      global.fetch = vi.fn().mockImplementation((_url: string, opts: RequestInit) => {
        capturedSignal = opts.signal as AbortSignal;
        return new Promise(() => {});
      });

      mockStartChatSession.mockResolvedValue({
        data: { session_id: 'session-1', user_message_id: 'um-1' },
        message: '',
      });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      act(() => {
        void result.current.sendSSEMessage({
          brand_id: 1,
          message: 'hi',
          agent_id: 'a',
          agent_type: 'default',
          session_id: 'session-1',
          user_id: 'u',
          s3_keys: [],
        });
      });

      await vi.waitFor(() => expect(mockStartChatSession).toHaveBeenCalled());

      act(() => {
        result.current.cancelStream('session-1');
      });

      expect(capturedSignal?.aborted).toBe(true);
    });
  });

  describe('connectToStream', () => {
    it('returns isCompleted=true when readStream resolves completed', async () => {
      mockReadStream.mockResolvedValue({ isCompleted: true });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      let outcome: { isCompleted: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.connectToStream('session-1');
      });

      expect(outcome?.isCompleted).toBe(true);
    });

    it('returns isCompleted=true when fetch returns non-ok status', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

      const { result } = renderHook(() =>
        useSSEHandler({ onMessage, onError, onSessionCreated })
      );

      let outcome: { isCompleted: boolean } | undefined;
      await act(async () => {
        outcome = await result.current.connectToStream('session-1');
      });

      expect(outcome?.isCompleted).toBe(true);
    });
  });
});
