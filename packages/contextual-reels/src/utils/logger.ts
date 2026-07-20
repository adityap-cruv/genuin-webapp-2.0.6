/**
 * Namespaced logger for the contextual-reels widget.
 *
 * In dev builds, all four levels write to the matching `console.*` channel.
 * In production builds, `debug` and `info` become no-ops; only `warn` and
 * `error` reach the console.
 *
 * Avoids `console.log` entirely (project guardrail).
 */

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

interface EnvOverride {
  PROD: boolean;
}

let envOverride: EnvOverride | undefined;

/**
 * @internal Test-only seam: lets unit tests force a PROD flag instead of
 *           depending on the host bundler's `import.meta.env`.
 */
export function __setEnvForTests(env: EnvOverride | undefined): void {
  envOverride = env;
}

function isProd(): boolean {
  if (envOverride) return envOverride.PROD;
  // `import.meta.env` is injected by Vite; guard for non-Vite test contexts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- import.meta.env shape is bundler-defined
  const meta = (import.meta as any).env as { PROD?: boolean } | undefined;
  return Boolean(meta?.PROD);
}

const noop = (): void => undefined;

/**
 * Build a logger bound to a namespace. The namespace is prepended in brackets
 * to every emitted log line so output is easy to filter in the browser console.
 *
 * @param namespace Short identifier (e.g. `cxr/player`).
 */
export function createLogger(namespace: string): Logger {
  const tag = `[${namespace}]`;
  const prod = isProd();
  return {
    debug: prod ? noop : (...args: unknown[]) => console.debug(tag, ...args),
    info: prod ? noop : (...args: unknown[]) => console.info(tag, ...args),
    warn: (...args: unknown[]) => console.warn(tag, ...args),
    error: (...args: unknown[]) => {
      console.error(tag, ...args);
      // Lazy import avoids a static cycle: pixel-reporter → config, logger is
      // imported from nearly everywhere, so a top-level import here risks
      // circular-import ordering issues in some bundlers.
      void import("@cxr/observability/pixel-reporter").then(({ PixelReporter }) => {
        PixelReporter.getInstance().report(undefined, "runtime", "runtime_error", { error: args });
      });
    },
  };
}
