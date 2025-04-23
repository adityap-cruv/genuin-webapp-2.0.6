import { GeneralError } from '@/components/general-error'
import { HeaderMobile } from '@/components/header/mobile'
import { NotFoundView } from '@/components/not-found-view'
import { getLoopDetails } from '@/components/pages/group/api'
import { Details } from '@/components/pages/group/details'
import { Loader } from '@/components/pages/group/loader'
import { TopBarContent } from '@/components/pages/group/top-bar-content'
import { TopBar } from '@/components/top-bar'
import { NOT_FOUND_ERROR_CODES } from '@/utils/constants/errors'
import { useId } from 'react'

export function GroupPage({ slug }: { slug: string }) {
  const detailsId = useId()
  const { data: groupDetails, isLoading, isError, error } = getLoopDetails(slug)

  if (isLoading) {
    return <Loader />
  }

  if (error?.message === NOT_FOUND_ERROR_CODES.group) {
    return <NotFoundView type='group' />
  }

  if (isError || !groupDetails) {
    return <GeneralError />
  }

  return (
    <>
      <HeaderMobile variant='white' />
      <TopBar idToTrack={detailsId}>
        <TopBarContent
          isSubscribed={groupDetails.is_subscriber ?? false}
          loopId={groupDetails.chat_id}
          loopName={groupDetails.group.group_name ?? ''}
          shareUrl={groupDetails.share_url}
          slug={groupDetails.slug}
          name={groupDetails.group.group_name ?? ''}
        />
      </TopBar>
      <Details
        detailsId={detailsId}
        loopDetails={groupDetails}
      />
    </>
  )
}
