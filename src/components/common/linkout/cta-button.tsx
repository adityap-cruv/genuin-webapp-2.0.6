import Link from 'next/link'
import { checkAndAppendHttps, cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

type CtaButtonProps = { link: string; text?: string | null; forMobile?: boolean; className?: string }

export function CtaButton({ link, text, forMobile = false, className }: CtaButtonProps) {
  return (
    <Link
      target="_blank"
      href={checkAndAppendHttps(link)}
      className={cn(
        'flex w-full items-center rounded-md py-2',
        forMobile
          ? 'justify-between bg-monochrome-white px-2'
          : 'justify-center bg-primary text-monochrome-white hover:bg-primary-600',
        className
      )}>
      {text}
      {forMobile && <ChevronRight className="h-6 w-6" />}
    </Link>
  )
}
