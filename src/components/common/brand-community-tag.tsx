'use client'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { PATH_NAME } from '@lib/utils/constants/path'
import Link from 'next/link'

export function BrandCommunityTag({
  brandSlug,
  brandLogo,
  brandName,
}: {
  brandSlug: string | null | undefined
  brandLogo: string | null | undefined
  brandName: string | null | undefined
}) {
  return (
    <>
      <Link href={{ pathname: PATH_NAME.brand(brandSlug ?? '') }}>
        <div className="flex items-center gap-1 rounded-full bg-tertiary-200 p-1 pr-1.5 ">
          <CustomAvatar
            imageUrl={brandLogo ?? ''}
            fallbackString={brandName ?? ''}
            isAvatar={false}
            className="h-4 w-4"
          />
          <p
            className="truncate text-cap-1-demi text-secondary"
            style={{
              maxWidth: '10ch',
            }}>
            {brandName}
          </p>
        </div>
      </Link>
    </>
  )
}
