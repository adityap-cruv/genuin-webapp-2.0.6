import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { useSessionContext } from './context';
import { SessionProvider } from './provider';

vi.mock('@/services/api', () => ({
  getChatHistoryV2: vi.fn(),
  getBrandSessions: vi.fn(),
  updateSessionTitle: vi.fn(),
}));

vi.mock('@/adapters/analytics/hooks', () => ({
  useOctoAnalytics: () => ({
    analytics: {
      trackSessionSwitched: vi.fn(),
      trackSessionCreated: vi.fn(),
    },
  }),
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

import { updateSessionTitle } from '@/services/api';
const mockUpdateSessionTitle = updateSessionTitle as Mock;

function makeWrapper(brandId = 1, currentSessionId?: string) {
  return ({ children }: { children: ReactNode }) => (
    <SessionProvider brandId={brandId} currentSessionId={currentSessionId}>
      {children}
    </SessionProvider>
  );
}

async function seedSession(result: { current: ReturnType<typeof useSessionContext> }) {
  await act(async () => {
    result.current.initSessions([
      {
        id: 'session-1',
        session_name: 'My Session',
        last_update_time: '2024-01-01T00:00:00.000Z',
        agent_id: 'agent-1',
      },
    ]);
  });
}

describe('SessionProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initSessions', () => {
    it('populates sessions from raw API data', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      expect(result.current.sessions).toHaveLength(1);
      expect(result.current.sessions[0]?.id).toBe('session-1');
      expect(result.current.sessions[0]?.name).toBe('My Session');
    });
  });

  describe('removeSession', () => {
    it('removes the session from the list', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      act(() => {
        result.current.removeSession('session-1');
      });

      expect(result.current.sessions).toHaveLength(0);
    });

    it('clears currentSessionId when removing the active session', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      act(() => {
        result.current.setCurrentSessionIdState('session-1');
      });

      act(() => {
        result.current.removeSession('session-1');
      });

      expect(result.current.currentSessionId).toBeNull();
    });

    it('does not clear currentSessionId when removing a different session', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await act(async () => {
        result.current.initSessions([
          {
            id: 'session-1',
            session_name: 'One',
            last_update_time: '2024-01-01T00:00:00.000Z',
            agent_id: 'agent-1',
          },
          {
            id: 'session-2',
            session_name: 'Two',
            last_update_time: '2024-01-01T00:00:00.000Z',
            agent_id: 'agent-1',
          },
        ]);
      });

      act(() => {
        result.current.setCurrentSessionIdState('session-1');
      });

      act(() => {
        result.current.removeSession('session-2');
      });

      expect(result.current.currentSessionId).toBe('session-1');
    });
  });

  describe('updateSessionName', () => {
    it('optimistically updates the name', async () => {
      mockUpdateSessionTitle.mockResolvedValue({ data: {} });
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      await act(async () => {
        await result.current.updateSessionName('session-1', 'Renamed');
      });

      expect(result.current.sessions[0]?.name).toBe('Renamed');
    });

    it('rolls back the name on API failure', async () => {
      mockUpdateSessionTitle.mockRejectedValue(new Error('Server error'));
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      await act(async () => {
        await result.current.updateSessionName('session-1', 'Bad Name');
      });

      await waitFor(() => {
        expect(result.current.sessions[0]?.name).toBe('My Session');
      });
    });
  });

  describe('startNewChat', () => {
    it('clears currentSessionId', async () => {
      const { result } = renderHook(() => useSessionContext(), {
        wrapper: makeWrapper(),
      });

      await seedSession(result);

      act(() => {
        result.current.setCurrentSessionIdState('session-1');
        result.current.setEnteredInChatMode(true);
      });

      act(() => {
        result.current.startNewChat();
      });

      expect(result.current.currentSessionId).toBeNull();
    });
  });
});
