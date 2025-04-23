import { cn } from '@/utils'
import type { ComponentProps } from 'react'
import { navigate } from './context'
import { useBrandDetails } from '@/context/brand-details'

export type CustomLinkProps = ComponentProps<'a'>

export function CustomLink({
  href,
  className,
  children,
  onClick,
  ...restProps
}: CustomLinkProps) {
  const { embedStyle } = useBrandDetails()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href) return

    if (embedStyle === 'standard_wall') {
      e.preventDefault() // Ensure this runs once
      try {
        const url = new URL(href)
        // As we only have to pass the pathname and to navigate internally.
        navigate(url.pathname + url.search)
      } catch (error) {
        console.error('Invalid URL:', href)
      }
    }

    onClick?.(e)
  }

  return (
    <a
      href={href}
      className={cn(className)}
      onClick={handleClick}
      {...restProps}>
      {children}
    </a>
  )
}
