import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface Props extends ComponentProps<'svg'> {
  strokeClassName?: string
}
export function ShareIcon({ strokeClassName = 'stroke-primary', ...props }: Props) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.56 25.6737L30 15.3368L18.56 5V11.9637H15.5556C9.2 11.9637 4 17.0362 4 22.9118L4 25.3471C4 25.6736 4.34667 26 4.69333 26H4.80889C5.04 26 5.27111 25.7824 5.38667 25.5648C6.6 22.572 7.9 18.9274 15.5556 18.9274H18.56V25.6737Z"
        className={cn(strokeClassName, 'group-hover:stroke-primary-600')}
        strokeWidth="2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
