// This file ensures consistent React type resolution across the monorepo
// Updated for React 19
import type * as React from "react";

// Force React type definitions to be consistent
declare module "react" {
  // ReactNode definition for React 19
  export type ReactNode = React.ReactElement | string | number | boolean | null | undefined | Iterable<ReactNode>;

  // FC type is deprecated in React 19, providing an alternative
  export type FC<P = object> = React.FunctionComponent<P>;
  export type FunctionComponent<P = object> = (props: P) => React.ReactNode;
}
