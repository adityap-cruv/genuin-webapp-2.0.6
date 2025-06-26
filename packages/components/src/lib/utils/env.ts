// @ts-nocheck
/**
 * Environment Variable Assignment Pattern
 *
 * This file assigns environment variables in a way that works seamlessly for both server-side (Next.js)
 * and client-side (browser/vite) execution contexts in a Next.js + Vite monorepo.
 *
 * - On the server (when `isServer` is true), environment variables are accessed via `process.env`.
 *   This is the standard Next.js mechanism for environment variables.
 * - On the client/vite, environment variables are accessed via `import.meta.env`, which is how Vite and
 *   other modern build tools expose environment variables to browser code.
 *
 * This conditional approach ensures:
 *   - The correct source is used for each environment.
 *   - Type safety is maintained (with explicit casting as needed).
 *   - Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client, following Next.js conventions.
 *
 * Why not always use one or the other?
 *   - `process.env` is only available in Next.js (server-side).
 *   - `import.meta.env` is only available in browser bundles (client-side/vite).
 *   - Using the wrong one in the wrong context will result in undefined values or runtime errors.
 *
 * This pattern is essential for universal/isomorphic code that runs in both environments,
 * such as shared configuration files in a monorepo setup.
 */

// Determine if running in server or client environment
const isServer = typeof process !== "undefined" && process.env;

// Export environment variables with proper typing
export const RUDDERSTACK_WRITE_KEY = isServer
  ? process.env.NEXT_PUBLIC_RUDDERSTACK_KEY
  : (import.meta.env.NEXT_PUBLIC_RUDDERSTACK_KEY as string);
export const RUDDERSTACK_DATAPLANE_URL = isServer
  ? process.env.NEXT_PUBLIC_RUDDERSTACK_URL
  : (import.meta.env.NEXT_PUBLIC_RUDDERSTACK_URL as string);
export const MEDIA_BASE_URL = isServer
  ? process.env.NEXT_PUBLIC_MEDIA_BASE_URL
  : (import.meta.env.NEXT_PUBLIC_MEDIA_BASE_URL as string);
export const NEXT_PUBLIC_HOST_URL = isServer
  ? process.env.NEXT_PUBLIC_HOST_URL
  : (import.meta.env.NEXT_PUBLIC_HOST_URL as string);
export const NEXT_PUBLIC_API_URL = isServer
  ? process.env.NEXT_PUBLIC_API_URL
  : (import.meta.env.NEXT_PUBLIC_API_URL as string);
