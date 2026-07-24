/**
 * Namespaced logger for the contextual-reels widget.
 *
 * In dev builds, all four levels write to the matching `console.*` channel.
 * In production builds, `debug` and `info` become no-ops; only `warn` and
 * `error` reach the console.
 *
 * Avoids `console.log` entirely (project guardrail).
 *
 * `logger.error` is CONSOLE-ONLY. It deliberately does NOT fire a
 * `px-script-error` pixel: most `.error(...)` call sites report recoverable
 * failures (geoip fetch blip, analytics flush failure, a caught cross-origin
 * SecurityError thrown by a host page's ad callback, a static-tag load that
 * then falls back to the API) after which the widget keeps working. Coupling
 * the pixel to log severity turned every such log into a false widget-failure
 * beacon. The pixel is now fired only from the genuinely widget-fatal
 * boundaries that own that decision — `index.jsx` (init crash + render
 * `SafeSuspense`) and `loader.jsx` (core bundle failed to load, `sdk_load`).
 * A partial failure that leaves the widget usable (e.g. one reel's HLS teardown,
 * a failed analytics flush) is logged here but must NOT report a widget failure.
 * Any future truly-fatal runtime site should call `PixelReporter.report(...)`
 * explicitly rather than relying on a log level.
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
    error: (...args: unknown[]) => console.error(tag, ...args),
  };
}
