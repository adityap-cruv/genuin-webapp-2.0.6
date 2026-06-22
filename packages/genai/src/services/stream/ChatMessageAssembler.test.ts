import { describe, expect, it } from 'vitest';

import type { Session } from '@/types';

import { assembleSSEMessage } from './ChatMessageAssembler';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    name: 'Test session',
    chat: [],
    agentId: 'agent-1',
    thinking: false,
    status: 'idle',
    updatedAt: '2024-01-01T00:00:00.000Z',
    hasNewName: false,
    hasNewMessage: false,
    thinkingSteps: [],
    ...overrides,
  };
}

describe('assembleSSEMessage', () => {
  describe('message chunks', () => {
    it('appends a new agent event when chat is empty', () => {
      const session = makeSession();
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', message: 'Hello', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.chat).toHaveLength(1);
      expect(updated.chat[0]?.role).toBe('agent');
      expect(updated.chat[0]?.message.content).toBe('Hello');
    });

    it('accumulates message chunks on the same agent_message_id', () => {
      const session = makeSession({
        chat: [
          {
            id: 'msg-1',
            message: { content: 'Hello' },
            role: 'agent',
            parent_id: null,
            feedback: null,
            created_at: '2024-01-01T00:00:00.000Z',
            isCompleted: false,
          },
        ],
      });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', message: ' world', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.chat[0]?.message.content).toBe('Hello world');
    });

    it('sets thinking=true while streaming', () => {
      const session = makeSession();
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', message: 'Thinking...', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.thinking).toBe(true);
    });
  });

  describe('response_completed', () => {
    it('sets thinking=false on response_completed=true', () => {
      const session = makeSession({ thinking: true });
      const { session: updated, responseCompleted } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', response_completed: true },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(responseCompleted).toBe(true);
      expect(updated.thinking).toBe(false);
    });

    it('marks last agent event isCompleted=true', () => {
      const session = makeSession({
        thinking: true,
        chat: [
          {
            id: 'msg-1',
            message: { content: 'Done' },
            role: 'agent',
            parent_id: null,
            feedback: null,
            created_at: '2024-01-01T00:00:00.000Z',
            isCompleted: false,
          },
        ],
      });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', response_completed: true },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.chat[0]?.isCompleted).toBe(true);
    });

    it('clears thinkingSteps on response_completed', () => {
      const session = makeSession({
        thinking: true,
        thinkingSteps: [{ id: 'step-1', type: 'message', title: 'Drafting', detail: 'hi' }],
      });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', response_completed: true },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.thinkingSteps).toHaveLength(0);
    });
  });

  describe('session name update', () => {
    it('updates session name when session_name differs', () => {
      const session = makeSession({ name: 'Old name' });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', session_name: 'New name', type: 'metadata' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.name).toBe('New name');
    });

    it('does not set hasNewName when session_name is unchanged', () => {
      const session = makeSession({ name: 'Same name' });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: { session_id: 'session-1', session_name: 'Same name', type: 'metadata' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.hasNewName).toBe(false);
    });
  });

  describe('temp session ID reconciliation', () => {
    it('replaces temp id with real id when isMatchedByTempId', () => {
      const session = makeSession({ id: 'temp-abc' });
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'real-xyz',
        data: { session_id: 'real-xyz', message: 'hi', agent_message_id: 'msg-1' },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.id).toBe('real-xyz');
    });
  });

  describe('thinking steps', () => {
    it('adds a function_call thinking step', () => {
      const session = makeSession();
      const { session: updated } = assembleSSEMessage({
        session,
        realSessionId: 'session-1',
        data: {
          session_id: 'session-1',
          function_name: 'search_web',
          type: 'function_call',
        },
        isSidebarCollapsed: false,
        currentSessionId: null,
      });

      expect(updated.thinkingSteps.some(s => s.type === 'function_call')).toBe(true);
    });

    it('caps thinkingSteps at MAX_THINKING_STEPS (4)', () => {
      const session = makeSession({ thinking: true, thinkingSteps: [] });
      let current = session;
      for (let i = 0; i < 6; i++) {
        const result = assembleSSEMessage({
          session: current,
          realSessionId: 'session-1',
          data: {
            session_id: 'session-1',
            function_name: `fn_${i}`,
            type: 'function_call',
          },
          isSidebarCollapsed: false,
          currentSessionId: null,
        });
        current = result.session;
      }

      expect(current.thinkingSteps.length).toBeLessThanOrEqual(4);
    });
  });
});
