/** Global lifecycle state for a single genai SDK instance. */
export enum OctoState {
    IDLE = 'IDLE',
    INITIALIZING = 'INITIALIZING',
    READY = 'READY',
    CREATING_SESSION = 'CREATING_SESSION',
    LOADING = 'LOADING',
    STREAMING = 'STREAMING',
    PAUSED = 'PAUSED',
    RESPONDING = 'RESPONDING',
    CANCELLING = 'CANCELLING',
    SWITCHING = 'SWITCHING',
    ERROR = 'ERROR',
    DESTROYED = 'DESTROYED',
}

/** Thrown when a transition is not in the allowed table. */
export class InvalidStateTransitionError extends Error {
    constructor(from: OctoState, to: OctoState) {
        super(`Invalid OctoState transition: ${from} → ${to}`);
        this.name = 'InvalidStateTransitionError';
    }
}

/** All valid transitions. Any pair not listed here is forbidden. */
export const OCTO_TRANSITIONS: Readonly<Record<OctoState, readonly OctoState[]>> = {
    [OctoState.IDLE]: [OctoState.INITIALIZING],
    [OctoState.INITIALIZING]: [OctoState.READY, OctoState.ERROR],
    [OctoState.READY]: [OctoState.CREATING_SESSION, OctoState.SWITCHING, OctoState.DESTROYED],
    [OctoState.CREATING_SESSION]: [OctoState.LOADING, OctoState.ERROR],
    [OctoState.LOADING]: [OctoState.STREAMING, OctoState.ERROR, OctoState.CANCELLING],
    [OctoState.STREAMING]: [OctoState.RESPONDING, OctoState.PAUSED, OctoState.CANCELLING, OctoState.ERROR],
    [OctoState.PAUSED]: [OctoState.STREAMING, OctoState.CANCELLING],
    [OctoState.RESPONDING]: [OctoState.READY, OctoState.SWITCHING, OctoState.ERROR],
    [OctoState.CANCELLING]: [OctoState.READY, OctoState.ERROR],
    [OctoState.SWITCHING]: [OctoState.READY, OctoState.ERROR],
    [OctoState.ERROR]: [OctoState.READY, OctoState.DESTROYED],
    [OctoState.DESTROYED]: [],
} as const;

/** Returns true if `from → to` is a valid transition. */
export function isValidTransition(from: OctoState, to: OctoState): boolean {
    return (OCTO_TRANSITIONS[from] as readonly OctoState[]).includes(to);
}
