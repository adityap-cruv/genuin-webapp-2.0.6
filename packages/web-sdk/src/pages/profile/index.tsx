import { getProfileDetails } from '@/components/pages/profile/api/details'
import { Details } from '@/components/pages/profile/details'
import Loader from '@/components/pages/profile/loader'
import { Posts } from '@/components/pages/profile/posts'
import { HeaderMobile } from '@/components/header/mobile'
import { GeneralError } from '@/components/general-error'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'
import { NotFoundView } from '@/components/not-found-view'
import { TopBar } from '@/components/top-bar'
import { useId } from 'react'
import { TopBarContent } from '@/components/pages/profile/top-bar-content'

export function ProfilePage({ slug }: { slug: string }) {
  const detailsId = useId()
  const {
    isLoading,
    data: profileDetails,
    isError,
    error,
  } = getProfileDetails(slug, false)

  if (isLoading) {
    return <Loader />
  }

  if (error?.message === NOT_FOUND_ERROR_CODES.user) {
    return <NotFoundView type='user' />
  }
  // TODO: Handle error state.
  if (isError || !profileDetails) {
    return <GeneralError />
  }

  const profileId = profileDetails?.user_id
  return (
    <>
      <HeaderMobile variant='white' />
      <TopBar idToTrack={detailsId}>
        <TopBarContent
          isAvatar={profileDetails.is_avatar}
          profileImage={
            profileDetails?.profile_image_m ?? profileDetails.profile_image
          }
          profileName={profileDetails.name ?? ''}
          profileNickname={profileDetails.nickname}
          shareUrl={profileDetails.share_url}
          brandUserLogo={profileDetails.brand?.brand_user_logo}
        />
      </TopBar>
      <div className='relative w-full h-full overflow-auto pb-20 md:pb-0'>
        <Details
          id={detailsId}
          profileDetails={profileDetails}
        />
        {profileId && (
          <Posts
            className='p-4 h-full w-full'
            profileId={profileId.toString()}
            forBrand={false}
          />
        )}
      </div>
    </>
  )
}
