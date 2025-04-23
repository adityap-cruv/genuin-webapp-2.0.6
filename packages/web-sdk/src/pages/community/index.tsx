import { GeneralError } from '@/components/general-error'
import { HeaderMobile } from '@/components/header/mobile'
import { NotFoundView } from '@/components/not-found-view'
import { getCommunityDetails } from '@/components/pages/community/api'
import { Details } from '@/components/pages/community/details'
import { Feed } from '@/components/pages/community/feed'
import { Loader } from '@/components/pages/community/loader'
import { TopBarContent } from '@/components/pages/community/top-bar-content'
import { TopBar } from '@/components/top-bar'
import { mapCommunityUserRole } from '@/components/tree-structure'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'
import { useId } from 'react'

type CommunityPagePropsType = { slug: string }

export function CommunityPage({ slug }: CommunityPagePropsType) {
  // here the slug may be 'cyber?feed=1'
  const splitArr = slug.split('?')
  slug = splitArr[0]

  const searchParams = new URLSearchParams(splitArr[1])
  const feed = searchParams.get('feed')

  if (feed === '1') return <Feed slug={slug} />
  return <CommunityDetails slug={slug} />
}

function CommunityDetails({ slug }: CommunityPagePropsType) {
  const detailsId = useId()
  const {
    data: communityDetails,
    isLoading,
    isError,
    error,
  } = getCommunityDetails(slug)

  if (isLoading) {
    return <Loader />
  }

  if (error?.message === NOT_FOUND_ERROR_CODES.community)
    return <NotFoundView type='community' />

  if (isError || !communityDetails) return <GeneralError />

  return (
    <>
      <HeaderMobile variant='white' />
      <TopBar idToTrack={detailsId}>
        <TopBarContent
          communitySlug={communityDetails.slug}
          communityId={communityDetails.community_id}
          communityName={communityDetails.name ?? ''}
          communityProfileImage={
            communityDetails.dp_m ?? communityDetails.dp ?? ''
          }
          isCommunityPrivate={communityDetails.type === 2}
          role={mapCommunityUserRole(
            communityDetails.logged_in_user_role,
            communityDetails.is_community_join_requested,
          )}
          shareUrl={communityDetails.share_url}
        />
      </TopBar>
      <Details
        detailsId={detailsId}
        communityDetails={communityDetails}
      />
    </>
  )
}
