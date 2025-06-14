'use client'

import { Details } from '@/components/profile-new/details'
import { Posts } from '@/components/profile-new/posts'
import { TopBar, TopBar as TopBarSticky } from '@/components/common/top-bar'
import { TopBarContent } from '@/components/profile-new/top-bar-content'
import { Toaster } from '@/components/ui/toaster'
import { type ProfileDetailsType } from '@/lib/schemas/profile/profile'
import { useId } from 'react'
import { useInvalidateOnUser } from '@/hooks/use-invalidate-on-user'

interface CompProps {
  profileDetails: ProfileDetailsType
}

export function ProfilePage({ profileDetails }: CompProps) {
  const detailsId = useId()
  const profileId = profileDetails?.user_id
  useInvalidateOnUser('profileCommunities', profileId?.toString() ?? '', false)

  return (
    <>
      <TopBarSticky idToTrack={detailsId}>
        <TopBarContent
          isAvatar={profileDetails.is_avatar}
          profileImage={profileDetails.profile_image}
          profileName={profileDetails.name ?? ''}
          profileNickname={profileDetails.nickname}
          shareUrl={profileDetails.share_url}
          brandUserLogo={profileDetails.brand?.brand_user_logo ?? undefined}
        />
      </TopBarSticky>
      <div className="h-body relative w-full overflow-auto pb-20 sm:h-full md:pb-0">
        <Details id={detailsId} profileDetails={profileDetails} />
        {profileId && <Posts className="h-full w-full p-4" profileId={profileId.toString()} forBrand={false} />}
      </div>
      <Toaster />
    </>
  )
}
