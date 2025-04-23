import React, { useContext, useEffect, useLayoutEffect } from 'react'
import ReactDOM from 'react-dom'
import ErrorBoundary from './error-boundary'
import { BaseContext } from '@/context/base'

type PortalElement = HTMLDivElement

type PortalProps = React.ComponentPropsWithoutRef<'div'> & {
  hideScrollbar: boolean
  container?: HTMLElement
}

export const CustomPortal = React.forwardRef<PortalElement, PortalProps>(
  (props, forwardedRef) => {
    const {
      className,
      container: containerProp,
      style,
      hideScrollbar,
      ...portalProps
    } = props
    // For adding brand colors
    const { customizations } = useContext(BaseContext)
    const [mounted, setMounted] = React.useState(false)
    useLayoutEffect(() => setMounted(true), [])
    const container = containerProp || (mounted && globalThis?.document?.body)

    useEffect(() => {
      if (!hideScrollbar) return
      document.body.classList.add('__gen__sdk__stop__scroll')
      return () => {
        document.body.classList.remove('__gen__sdk__stop__scroll')
      }
    }, [])

    return container
      ? ReactDOM.createPortal(
          <ErrorBoundary>
            <div
              style={{ ...style, ...customizations?.brandColors }}
              className={`gen-sdk-class ${className ? className : ''}`}
              {...portalProps}
              ref={forwardedRef}
            />
          </ErrorBoundary>,
          container,
        )
      : null
  },
)
