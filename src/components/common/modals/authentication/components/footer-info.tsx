import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { PATH_NAME } from '@/lib/utils/constants/path'

export function FooterInfo({ className, ...restProps }: ComponentProps<'p'>) {
  return (
    <p className={cn('text-new-para-2-mobile', className)} {...restProps}>
      By continuing, you're agree to
      <a href={PATH_NAME.terms} target="_blank" rel="noopener noreferrer">
        <span className="text-primary"> Terms of Service </span>
      </a>
      and
      <a href={PATH_NAME.privacy} target="_blank" rel="noopener noreferrer">
        <span className="text-primary"> Privacy Policy</span>
      </a>
    </p>
  )
}
