import { ReactNode } from 'react'

type ConditionalWrapperProps = {
  /**
   * Boolean condition that determines whether to apply the wrapper
   */
  condition: boolean

  /**
   * Function that receives children and returns them wrapped in a component
   */
  wrapper: (children: ReactNode) => ReactNode

  /**
   * The content to potentially wrap
   */
  children: ReactNode
}

/**
 * Conditionally wraps children with a component based on a condition
 */
const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
}: ConditionalWrapperProps): ReactNode =>
  condition ? wrapper(children) : children

export default ConditionalWrapper
