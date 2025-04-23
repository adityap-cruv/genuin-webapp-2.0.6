import { CustomAvatar } from '../custom-avatar'
import { type RepostCommunityType } from './schema'
import { DecorativeList } from '../decorative-list'
import { LoopPrivacyInfo } from '../loop-privacy-info'
import { Button } from '../ui/button'
import { RepostIcon } from '../icons/repost-icon'
import { repostVideo } from './api'
import { useState } from 'react'
import { Loader } from '../loader'
import { cn } from '@/utils'
import { NoSearchResults } from '../no-search-results'
import { EarthIcon } from '../icons/earth-icon'
import { Lock } from 'lucide-react'
import { useRepostModalContext } from '@/components/repost/context'

export function Body() {
  const {
    repostCommunityData: data,
    filteredRepostCommunityData: filteredData,
    searchStr: searchString,
  } = useRepostModalContext()
  const dataToRender = filteredData ?? data

  if (!dataToRender || dataToRender.length === 0) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <NoSearchResults forKeyword={searchString} />
      </div>
    )
  }

  return (
    <div className='relative h-full w-full overflow-x-clip overflow-scroll py-3 pr-2'>
      {dataToRender.map((item) => {
        return (
          <div key={item.community_id}>
            <CommunityCard communityInfo={item} />
          </div>
        )
      })}
    </div>
  )
}

function CommunityCard({
  communityInfo,
}: {
  communityInfo: RepostCommunityType
}) {
  return (
    <>
      <div className='flex items-center justify-between'>
        <span className='flex gap-x-3'>
          <CustomAvatar
            fallbackString={communityInfo.name ?? ''}
            imageUrl={communityInfo.dp_m ?? communityInfo.dp ?? ''}
            isAvatar={false}
            className='h-10 w-10'
          />
          <span className='flex flex-col items-start justify-center'>
            <p className='line-clamp-1 break-all text-body-1-bold'>
              {communityInfo.name}
            </p>
            <span className='flex items-center justify-center gap-1'>
              {communityInfo.type === 'PUBLIC' ? (
                <EarthIcon className='h-4 w-4 stroke-tertiary' />
              ) : (
                <Lock className='h-4 w-4 stroke-tertiary' />
              )}
              <p className='line-clamp-1 break-all text-cap-1-med text-tertiary'>
                {communityInfo.type === 'PUBLIC' ? 'Public' : 'Private'}
              </p>
            </span>
          </span>
        </span>
        {/* TODO: check if any link must be put here. */}
        <div className='flex items-center gap-0.5 rounded-full border border-tertiary-200 bg-tertiary-100 px-1 py-0.5'>
          <CustomAvatar
            fallbackString={communityInfo.brand.name ?? ''}
            imageUrl={communityInfo.brand.logo}
            isAvatar={false}
            className='h-4 w-4'
          />
          <p className='line-clamp-1 max-w-[80px] break-all text-cap-1-demi'>
            {communityInfo.brand.name}
          </p>
        </div>
      </div>
      <DecorativeList className='pt-4'>
        {communityInfo.chats.map((item, index) => {
          return (
            <li
              key={index}
              className='mb-4 before:!left-[-17px] relative flex w-full items-center justify-between rounded-lg border border-tertiary-200 bg-tertiary-100 px-4 py-3'>
              <div>
                <p className='line-clamp-1 break-all text-body-1-demi'>
                  {item.group.group_name}
                </p>
                <LoopPrivacyInfo
                  accessTypeId={item.actions[0].access_type_id}
                  actionId={item.actions[0].action_id}
                />
              </div>
              <RepostButton destinationId={item.chat_id} />
            </li>
          )
        })}
      </DecorativeList>
    </>
  )
}

function RepostButton({ destinationId }: { destinationId: string }) {
  const [status, setStatus] = useState<{
    repostStatus: boolean
    isLoading: boolean
  }>({
    repostStatus: false,
    isLoading: false,
  })
  const { videoId: sourceVideoId } = useRepostModalContext()

  return (
    <Button
      onClick={async () => {
        setStatus((x) => {
          x.isLoading = true
          return { ...x }
        })
        const ans = await repostVideo(destinationId, sourceVideoId)
        setStatus((x) => {
          x.isLoading = false
          x.repostStatus = ans
          return { ...x }
        })
      }}
      variant={status.repostStatus ? 'default' : 'outline'}
      className={cn(
        'gap-x-1 whitespace-nowrap border-primary border-solid p-0 text-body-1-demi',
        status.repostStatus &&
          'cursor-not-allowed bg-primary hover:bg-primary-600',
      )}>
      {status.isLoading ? (
        <div className='flex w-20 items-center justify-center px-4 py-2'>
          <Loader />
        </div>
      ) : (
        <div className='flex gap-x-1 py-2 pl-2 pr-4'>
          <RepostIcon
            className={cn(
              'h-5 w-5 stroke-primary',
              status.repostStatus && 'stroke-white',
            )}
          />
          <p
            className={cn('text-primary', status.repostStatus && 'text-white')}>
            {status.repostStatus ? 'Reposted' : 'Repost'}
          </p>
        </div>
      )}
    </Button>
  )
}
