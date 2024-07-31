import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { PATH_NAME } from '@/lib/utils/constants/path'

export function FooterInfo({ className, ...restProps }: ComponentProps<'p'>) {
  const brandName = useGenuinOptions().config?.name

  return (
    <p className={cn('text-new-para-2-mobile', className)} {...restProps}>
      By registering, you agree to {brandName ?? 'genuin'}'s
      <a href={PATH_NAME.terms} target="_blank" rel="noopener noreferrer">
        <span className="text-primary"> Terms of Service </span>
      </a>
      and
      <a href={PATH_NAME.privacy} target="_blank" rel="noopener noreferrer">
        <span className="text-primary"> Privacy</span>
      </a>
    </p>
  )
}
