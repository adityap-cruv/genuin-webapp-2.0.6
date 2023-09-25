import { cn } from '@lib/utils'
import { cva } from 'class-variance-authority'

interface Props {
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

export function Loader({ size = 'sm' }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className={cn(loaderVariant({ size }), 'border-t-transparent border-l-transparent')} />
    </div>
  )
}
