import { cn } from '@lib/utils'
import { type DetailedHTMLProps, type HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'

type Props = {
  size: 'sm' | 'md' | 'lg' | 'xl'
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const loaderVariant = cva('animate-spin rounded-full border-4 border-primary', {
  variants: {
    size: {
      sm: 'h-5 w-5',
      md: 'h-7 w-7',
      lg: 'h-9 w-9',
      xl: 'h-11 w-11',
    },
  },
})

export function Loader({ size = 'sm', className, style }: Props) {
  return (
    <span className={cn(className, 'flex h-full w-full items-center justify-center')} style={style}>
      <div className={cn(loaderVariant({ size }), 'border-l-transparent border-t-transparent')} />
    </span>
  )
}
