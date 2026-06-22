/**
 * Type stub for `react-dom/client`.
 *
 * React 19 ships its own types for this module but `@types/react-dom` may not
 * be installed in this workspace. This ambient declaration silences TS7016 in
 * test files that use `createRoot` / `Root` from `react-dom/client`.
 *
 * The module re-exports are typed loosely as `any` because the actual types
 * come from React 19 at runtime — this stub only exists to satisfy tsc.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "react-dom/client" {
  export const createRoot: any;
  export type Root = any;
}
