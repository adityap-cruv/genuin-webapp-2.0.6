import { cn } from '@lib/utils'
import { DetailedHTMLProps, HTMLAttributes } from 'react'
import { cva } from 'class-variance-authority'

interface Props extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  size: 'sm' | 'md' | 'lg' | 'xl'
}

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
    <div className={cn(className, 'flex h-full w-full items-center justify-center')} style={style}>
      <div className={cn(loaderVariant({ size }), 'border-l-transparent border-t-transparent')} />
    </div>
  )
}
