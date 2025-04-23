import { ComponentProps } from 'react'

type ButtonPropsType = ComponentProps<'button'>

export function Button({ children, ...restProps }: ButtonPropsType) {
  return <button {...restProps}>{children}</button>
}
