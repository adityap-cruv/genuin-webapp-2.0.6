/** Controls auto-prompt behaviour for a web-SDK instance. */
export interface AutoPromptConfig {
  /** Master switch. When false the cycle never arms. */
  enabled: boolean;
  /** Auto-send the prompt when the countdown completes. false = prefill the input and stop. */
  autoSend: boolean;
  /**
   * What to do after a completed response has been held:
   *  - `collapse-loop` — shrink to compact, then loop (mobile default)
   *  - `hold-loop`     — stay full, then loop          (desktop default)
   *  - `stop`          — run one cycle, then stop
   */
  afterResponse: 'collapse-loop' | 'hold-loop' | 'stop';
  timings: {
    /** ms shown in the countdown bubble before auto-sending. */
    countdownMs: number;
    /** ms a completed response stays full before collapse/loop. */
    responseHoldMs: number;
    /** ms to pause between collapse and the next countdown. */
    loopGapMs: number;
  };
}

/** Legacy shape accepted at the `init()` boundary for backward compatibility. */
export interface LegacyAutoPromptConfig {
  mode: 'disabled' | 'countdown-only' | 'full';
  countdownMs?: number;
  idealDelayMs?: number;
  nextPromptDelayMs?: number;
  disableAutoClose?: boolean;
}

export const DEFAULT_AUTO_PROMPT_CONFIG: AutoPromptConfig = {
  enabled: true,
  autoSend: true,
  afterResponse: 'collapse-loop',
  timings: { countdownMs: 3_000, responseHoldMs: 5_000, loopGapMs: 30_000 },
};

function isLegacy(input: AutoPromptConfig | LegacyAutoPromptConfig): input is LegacyAutoPromptConfig {
  return 'mode' in input;
}

/**
 * Accepts either the legacy or the current config shape and returns the current shape.
 * Use this at every `init()` / provider boundary so downstream consumers always work
 * with `AutoPromptConfig`.
 */
export function normalizeAutoPromptConfig(
  input: AutoPromptConfig | LegacyAutoPromptConfig,
): AutoPromptConfig {
  if (!isLegacy(input)) return input;
  const d = DEFAULT_AUTO_PROMPT_CONFIG;
  return {
    enabled: input.mode !== 'disabled',
    autoSend: input.mode === 'full',
    afterResponse: input.disableAutoClose ? 'hold-loop' : 'collapse-loop',
    timings: {
      countdownMs: input.countdownMs ?? d.timings.countdownMs,
      responseHoldMs: input.idealDelayMs ?? d.timings.responseHoldMs,
      loopGapMs: input.nextPromptDelayMs ?? d.timings.loopGapMs,
    },
  };
}
