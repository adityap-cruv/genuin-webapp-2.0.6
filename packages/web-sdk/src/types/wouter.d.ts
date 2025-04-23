// This file provides custom type declarations for the wouter library
// to resolve compatibility issues with React 18.3

import * as React from 'react'
import { DefaultParams, PathPattern } from 'wouter'

declare module 'wouter' {
  interface SwitchProps {
    children: React.ReactNode
    location?: string
  }

  interface RouteProps<
    T extends DefaultParams | undefined = undefined,
    P extends PathPattern = PathPattern,
  > {
    children:
      | React.ReactNode
      | ((params: T extends undefined ? DefaultParams : T) => React.ReactNode)
    path: P
  }

  export function Switch(props: SwitchProps): React.ReactElement
  export function Route<
    T extends DefaultParams | undefined = undefined,
    P extends PathPattern = PathPattern,
  >(props: RouteProps<T, P>): React.ReactElement
}
