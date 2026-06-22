import { describe, expect, it } from 'vitest';

import {
  InvalidStateTransitionError,
  isValidTransition,
  OCTO_TRANSITIONS,
  OctoState,
} from './octo-state';

describe('OctoState transitions', () => {
  describe('isValidTransition', () => {
    it('allows IDLE → INITIALIZING', () => {
      expect(isValidTransition(OctoState.IDLE, OctoState.INITIALIZING)).toBe(true);
    });

    it('allows INITIALIZING → READY', () => {
      expect(isValidTransition(OctoState.INITIALIZING, OctoState.READY)).toBe(true);
    });

    it('allows INITIALIZING → ERROR', () => {
      expect(isValidTransition(OctoState.INITIALIZING, OctoState.ERROR)).toBe(true);
    });

    it('allows full happy path: READY → CREATING_SESSION → LOADING → STREAMING → RESPONDING → READY', () => {
      const path = [
        [OctoState.READY, OctoState.CREATING_SESSION],
        [OctoState.CREATING_SESSION, OctoState.LOADING],
        [OctoState.LOADING, OctoState.STREAMING],
        [OctoState.STREAMING, OctoState.RESPONDING],
        [OctoState.RESPONDING, OctoState.READY],
      ] as const;
      for (const [from, to] of path) {
        expect(isValidTransition(from, to)).toBe(true);
      }
    });

    it('allows STREAMING → CANCELLING', () => {
      expect(isValidTransition(OctoState.STREAMING, OctoState.CANCELLING)).toBe(true);
    });

    it('allows CANCELLING → READY', () => {
      expect(isValidTransition(OctoState.CANCELLING, OctoState.READY)).toBe(true);
    });

    it('rejects IDLE → READY (skip INITIALIZING)', () => {
      expect(isValidTransition(OctoState.IDLE, OctoState.READY)).toBe(false);
    });

    it('rejects STREAMING → IDLE', () => {
      expect(isValidTransition(OctoState.STREAMING, OctoState.IDLE)).toBe(false);
    });

    it('rejects READY → STREAMING (skip CREATING_SESSION)', () => {
      expect(isValidTransition(OctoState.READY, OctoState.STREAMING)).toBe(false);
    });

    it('rejects DESTROYED → anything', () => {
      const allStates = Object.values(OctoState);
      for (const to of allStates) {
        expect(isValidTransition(OctoState.DESTROYED, to)).toBe(false);
      }
    });

    it('DESTROYED has empty transition list in OCTO_TRANSITIONS', () => {
      expect(OCTO_TRANSITIONS[OctoState.DESTROYED]).toHaveLength(0);
    });

    it('allows ERROR → READY (recovery)', () => {
      expect(isValidTransition(OctoState.ERROR, OctoState.READY)).toBe(true);
    });

    it('allows ERROR → DESTROYED', () => {
      expect(isValidTransition(OctoState.ERROR, OctoState.DESTROYED)).toBe(true);
    });
  });

  describe('InvalidStateTransitionError', () => {
    it('has correct message format', () => {
      const err = new InvalidStateTransitionError(OctoState.IDLE, OctoState.STREAMING);
      expect(err.message).toBe('Invalid OctoState transition: IDLE → STREAMING');
    });

    it('has correct name', () => {
      const err = new InvalidStateTransitionError(OctoState.IDLE, OctoState.STREAMING);
      expect(err.name).toBe('InvalidStateTransitionError');
    });

    it('is instanceof Error', () => {
      const err = new InvalidStateTransitionError(OctoState.IDLE, OctoState.STREAMING);
      expect(err).toBeInstanceOf(Error);
    });
  });
});
