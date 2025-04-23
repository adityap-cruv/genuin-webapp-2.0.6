import React, { type ReactNode, type ComponentProps } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryUi />
    }

    return this.props.children
  }
}

export default ErrorBoundary

export function ErrorBoundaryUi({
  style,
  className,
  ...restProps
}: ComponentProps<'h1'>) {
  return (
    <h1
      style={{
        height: '100%',
        width: '100%',
        ...style,
      }}
      className={
        '__gen__sdk__text__title__1 __gen__sdk__flex__center' + ' ' + className
      }
      {...restProps}>
      Something went wrong. Please try refreshing the page.
    </h1>
  )
}
