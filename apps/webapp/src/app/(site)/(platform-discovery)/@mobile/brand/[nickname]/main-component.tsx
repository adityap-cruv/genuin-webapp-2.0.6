'use client'

import { Details } from '@/components/profile-new/details'
import { Posts } from '@/components/profile-new/posts'
import { TopBar as TopBarSticky } from '@/components/common/top-bar'
import { TopBarContent } from '@/components/profile-new/top-bar-content'
import { Toaster } from '@/components/ui/toaster'
import { type ProfileDetailsType } from '@/lib/schemas/profile/profile'
import { useId } from 'react'
import { useInvalidateOnUser } from '@/hooks/use-invalidate-on-user'

interface CompProps {
  brandDetails: ProfileDetailsType
}

export function BrandPage({ brandDetails }: CompProps) {
  const detailsId = useId()
  const brandId = brandDetails.brand?.brand_id
  useInvalidateOnUser('profileCommunities', brandId?.toString() ?? '', true)
  return (
    <>
      <TopBarSticky idToTrack={detailsId}>
        <TopBarContent
          isAvatar={brandDetails.is_avatar}
          profileImage={brandDetails.profile_image}
          profileName={brandDetails.name ?? ''}
          profileNickname={brandDetails.nickname}
          shareUrl={brandDetails.share_url}
          brandUserLogo={brandDetails.brand?.brand_user_logo ?? undefined}
        />
      </TopBarSticky>
      <div className="h-body relative w-full overflow-auto pb-20 sm:h-full md:pb-0">
        <Details id={detailsId} profileDetails={brandDetails} />
        {brandId && <Posts className="h-full w-full p-4" profileId={brandId.toString()} forBrand />}
      </div>
      <Toaster />
    </>
  )
}
