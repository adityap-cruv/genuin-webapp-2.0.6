'use client'
import { CustomAvatar } from '@/components/custom-avatar'
import { CustomLink } from '@/router/custom-link'
import { cn, getRedirectionStatusForPaths } from '@/utils'
import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { ComponentProps } from 'react'

type BrandCommunityTagProps = {
  brandSlug?: string | null
  brandLogo?: string | null
  brandName?: string | null
} & ComponentProps<'a'>

export function BrandCommunityTag({
  brandSlug,
  brandLogo,
  brandName,
  href,
  className,
  target,
  ...restProps
}: BrandCommunityTagProps) {
  const redirectionStatus = getRedirectionStatusForPaths()
  const pathName = usePathNameWithSubdomain()

  return (
    <CustomLink
      target='_blank'
      href={pathName.brand(brandSlug ?? '')}
      className={cn(
        className,
        !redirectionStatus.profile && 'pointer-events-none',
      )}
      {...restProps}>
      <div className='flex items-center gap-1 rounded-full bg-tertiary-200 p-1 pr-1.5 '>
        <CustomAvatar
          imageUrl={brandLogo ?? ''}
          fallbackString={brandName ?? ''}
          isAvatar={false}
          className='h-4 w-4'
        />
        <p
          className='truncate text-cap-1-demi text-secondary'
          style={{
            maxWidth: '10ch',
          }}>
          {brandName}
        </p>
      </div>
    </CustomLink>
  )
}
