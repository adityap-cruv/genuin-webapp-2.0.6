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

export function BrandPage({ slug }: { slug: string }) {
  const {
    isLoading,
    data: brandDetails,
    isError,
    error,
  } = getProfileDetails(slug, true)
  const detailsId = useId()

  if (isLoading) {
    return <Loader />
  }

  if (error?.message === NOT_FOUND_ERROR_CODES.brand)
    return <NotFoundView type='brand' />

  if (isError || !brandDetails) {
    return <GeneralError />
  }

  const brandId = brandDetails.brand?.brand_id
  return (
    <>
      <HeaderMobile variant='white' />
      <TopBar idToTrack={detailsId}>
        <TopBarContent
          isAvatar={brandDetails.is_avatar}
          profileImage={
            brandDetails?.profile_image_m ?? brandDetails.profile_image
          }
          profileName={brandDetails.name ?? ''}
          profileNickname={brandDetails.nickname}
          shareUrl={brandDetails.share_url}
          brandUserLogo={brandDetails.brand?.brand_user_logo}
        />
      </TopBar>
      <div className='relative w-full h-full overflow-auto pb-20 md:pb-0'>
        <Details
          id={detailsId}
          profileDetails={brandDetails}
        />
        {brandId && (
          <Posts
            className='p-4 h-full w-full'
            profileId={brandId.toString()}
            forBrand
          />
        )}
      </div>
    </>
  )
}
