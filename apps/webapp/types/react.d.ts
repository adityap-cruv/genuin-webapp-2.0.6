// This file ensures consistent React type resolution across the monorepo
import * as React from 'react';

// Force React type definitions to be consistent
declare module 'react' {
  // Re-export to ensure consistency
  export = React;

  // Explicitly define ReactNode to resolve the type conflict
  export type ReactNode =
    | React.ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | React.ReactNodeArray;

  export type ReactNodeArray = Array<ReactNode>;
}

export = React;
export as namespace React;
