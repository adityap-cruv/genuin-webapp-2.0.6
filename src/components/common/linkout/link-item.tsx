import Link from 'next/link'
import { LinkIcon, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type MouseEventHandler } from 'react'

type LinkItemProps = {
  title?: string | null
  link: string
  hasImage?: boolean
  /**
   * It will render different color for mobile component.
   */
  forMobile?: boolean
  onClick: MouseEventHandler<HTMLAnchorElement>
}

export function LinkItem({ link, hasImage = false, title, forMobile = false, onClick }: LinkItemProps) {
  return (
    <Link
      target="_blank"
      href={link}
      className={cn(
        'flex w-full items-center justify-between gap-3 p-2',
        !hasImage && !forMobile && 'rounded-lg bg-tertiary-200'
      )}
      onClick={onClick}>
      <span className="flex items-center gap-2">
        {!title && <LinkIcon className={cn('h-4 w-4 shrink-0', forMobile && 'stroke-monochrome-white')} />}
        <p className={cn('line-clamp-1 break-all text-body-1-demi', forMobile && 'text-monochrome-white')}>
          {title && title !== '' ? title : link}
        </p>
      </span>
      {!hasImage && !forMobile && <ChevronRight className="h-4 w-4 shrink-0" />}
    </Link>
  )
}
