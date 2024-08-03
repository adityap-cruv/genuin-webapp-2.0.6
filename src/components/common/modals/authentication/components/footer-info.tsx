import { cn } from '@/lib/utils'
import { type ComponentProps } from 'react'
import { PATH_NAME } from '@/lib/utils/constants/path'
import Link from 'next/link'

export function FooterInfo({ className, ...restProps }: ComponentProps<'p'>) {
  return (
    <p className={cn('text-center text-new-para-2-mobile', className)} {...restProps}>
      By continuing, you're agree to
      <Link href={PATH_NAME.terms} target="_blank" rel="noopener noreferrer">
        <span className="text-primary"> Terms of Service </span>
      </Link>
      and
      <Link href={PATH_NAME.privacy} target="_blank" rel="noopener noreferrer">
        <span className="text-primary"> Privacy Policy</span>
      </Link>
    </p>
  )
}
