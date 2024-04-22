import { CustomAvatar } from '@components/custom/custom-avatar'
import { getCommunityLoops } from '@lib/api/community'
import { abbreviateNumber, getTimeAgo } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import Image from 'next/image'
import Link from 'next/link'
import noLoopsImage from '@images/noLoopImage.svg'
import icPlay from '@icons/player-controls/icPlay.svg'
import { useState } from 'react'
import { PlayerModal } from '@components/common/modals/player-modal'
import { getLoopVideos } from '@lib/api/loop'
import icLock from '@icons/icLock.svg'
import { Shimmer } from '@components/ui/shimmer'
import { type VideoPlayerModalCommunityType, type VideoPlayerModalLoopType } from '@lib/schemas/player/video'
import { type CommunityLoopType } from '@lib/schemas/community/loops'

// TODO: remove this component from here and put at better location
export function CommunityLoopTab({ community }: { community: VideoPlayerModalCommunityType }) {
  const { data, isLoading } = getCommunityLoops(community.slug)
  const [modalController, setModalController] = useState<{ open: boolean; loop: VideoPlayerModalLoopType | null }>({
    open: false,
    loop: null,
  })

  if (isLoading)
    return (
      <>
        <LoopDetailsTabShimmer />
        <LoopDetailsTabShimmer />
        <LoopDetailsTabShimmer />
      </>
    )

  if (!data || data.loops.length === 0) return <NoLoops />

  if (data.loops.length !== 0)
    return (
      <>
        {data.loops.map((item, index) => {
          return (
            <LoopItem
              key={index}
              loopDetails={item}
              openModal={() => {
                setModalController((x) => {
                  x.open = true
                  x.loop = { id: item.chat_id, slug: item.slug, name: item.group.group_name }
                  return { ...x }
                })
              }}
            />
          )
        })}
        {modalController.loop && (
          <PlayerModalWrapper
            close={() => {
              setModalController((x) => {
                x.open = false
                return { ...x }
              })
            }}
            loop={modalController.loop}
            community={community}
            open={modalController.open}
          />
        )}
      </>
    )
}

function LoopItem({
  loopDetails,
  openModal,
}: {
  loopDetails: CommunityLoopType
  openModal: (slug: VideoPlayerModalLoopType) => void
}) {
  function getCollaboratorsCountString(count: any) {
    let str = ' + '
    if (!count) return
    if (count === 1) {
      str += abbreviateNumber(count) + ' Collaborator'
    } else {
      str += abbreviateNumber(count) + ' Collaborators'
    }
    return str
  }

  function Members() {
    const members = loopDetails.group.members
    return (
      <>
        {members[0] && (
          <CustomAvatar
            className="z-20 h-6 w-6 border-2 border-tertiary-100 bg-red-50"
            imageUrl={members[0].profile_image ?? ''}
            isAvatar={members[0].is_avatar}
            fallbackString={members[0].name ?? ''}
          />
        )}
        {members.length !== 0 && members[1] && (
          <CustomAvatar
            className="absolute left-3 z-10 h-6 w-6 border-2 border-tertiary-100 bg-red-50"
            imageUrl={members[1].profile_image ?? ''}
            isAvatar={members[1].is_avatar}
            fallbackString={members[1].name ?? ''}
          />
        )}
        {members.length !== 0 && members[2] && (
          <CustomAvatar
            className="absolute left-6 h-6 w-6 border-2 border-tertiary-100 bg-red-50"
            imageUrl={members[2].profile_image ?? ''}
            isAvatar={members[2].is_avatar}
            fallbackString={members[2].name ?? ''}
          />
        )}
      </>
    )
  }

  return (
    <div className="relative">
      <Link href={PATH_NAME.loop(loopDetails.slug)}>
        <div className="py-2">
          <div className="relative w-full rounded-lg border border-tertiary-200 bg-monochrome-white">
            <div className="w-[70%] items-center p-[3%]">
              <p className="text-body-1-bold">{loopDetails.group.group_name}</p>
              {loopDetails.latest_messages.length !== 0 && loopDetails.is_view_allowed && (
                <p className="text-body-1-demi text-secondary-300">
                  @{loopDetails.latest_messages[0].owner.username} posted ∙{' '}
                  {getTimeAgo(loopDetails.latest_messages[0].message_at)}
                </p>
              )}
            </div>
            <div className="h-[60%] rounded-b-lg border border-tertiary-200 bg-tertiary-100 p-4">
              <div className="flex w-[68%] items-center">
                <div className="relative flex">
                  <Members />
                </div>
                <p
                  className={`ml-1 line-clamp-1 text-body-1-med text-secondary-300 ${
                    loopDetails.group.members.length !== 1 && 'ml-7'
                  } ${loopDetails.group.members.length === 3 && 'ml-6'}`}>
                  {loopDetails.group.members[0].username}
                  {getCollaboratorsCountString(loopDetails.group.members.length - 1)}
                </p>
              </div>
              <p className="my-[2%] line-clamp-2 w-[68%] text-body-1-demi text-secondary-300">
                {loopDetails.group.group_description}
              </p>
              <p className="w-[68%] text-body-1-med text-secondary-300">
                {abbreviateNumber(loopDetails.group.members.length)} subscribers ∙{' '}
                {abbreviateNumber(loopDetails.group.no_of_views)} views
              </p>
            </div>
            {/* {renderedImages} */}
          </div>
        </div>
      </Link>
      {!loopDetails.is_view_allowed ? (
        <div className="group/video absolute right-7 top-[50%] flex aspect-reel h-[80%] -translate-y-1/2 items-center justify-center rounded border border-tertiary-200 bg-monochrome-white hover:cursor-pointer">
          <div className="rounded-full bg-tertiary-200 p-2">
            <Image src={icLock} alt="share" className="h-4 w-4" />
          </div>
        </div>
      ) : (
        <RenderedImages
          videos={loopDetails.latest_messages}
          onClick={() => {
            openModal({ id: loopDetails.chat_id, slug: loopDetails.slug, name: loopDetails.group.group_name })
          }}
        />
      )}
    </div>
  )
}

function NoLoops() {
  return (
    <div className="flex h-full">
      <div className="mt-4 flex flex-col items-center justify-center bg-tertiary-100">
        <Image src={noLoopsImage} alt="share" />
        <p className="text-title-2-bold">No Loops... yet!</p>
        <p className="w-[80%] text-center text-body-1-demi text-monochrome">
          Loops are dynamic discussion spaces centered around specific themes. Members can share videos, get reactions,
          and enjoy engaging comments from the community.
        </p>
      </div>
    </div>
  )
}

function RenderedImages({ videos, onClick }: { videos: any; onClick: () => void }) {
  const transformValues: any = {
    1: [50],
    2: [48, 52],
    3: [46, 50, 54],
  }

  const rightValues: any = {
    1: [20],
    2: [24, 16],
    3: [28, 20, 12],
  }

  const opacitValues: any = {
    1: [1],
    2: [1, 0.5],
    3: [1, 0.66, 0.4],
  }
  const videosLength = videos.length

  return (
    <span onClick={onClick}>
      {videos.map((item: any, index: number) => {
        return (
          <div
            key={index}
            className="group/video absolute top-[50%] flex aspect-reel h-[80%] items-center justify-center rounded hover:cursor-pointer"
            style={{
              right: `${rightValues[videosLength][index]}px`,
              transform: `translateY(-${transformValues[videosLength][index]}%)`,
              zIndex: videosLength - index + 1,
              opacity: `${opacitValues[videosLength][index]}`,
            }}>
            <img className="rounded" src={item.thumbnail_url} />
            <div className="absolute inset-0 hidden h-full w-full items-center justify-center bg-monochrome-black/30 group-hover/video:flex">
              <Image src={icPlay} alt="play" className="absolute" />
            </div>
          </div>
        )
      })}
    </span>
  )
}

type PlayerModalWrapperProps = {
  open: boolean
  loop: VideoPlayerModalLoopType
  community: VideoPlayerModalCommunityType
  close: () => void
}

function PlayerModalWrapper({ open = false, loop, community, close }: PlayerModalWrapperProps) {
  const { data, fetchNextPage, isError, isFetchingNextPage, isFetching } = getLoopVideos({ community, loop })
  const videos = data?.pages.flatMap((item) => item.videos)

  return (
    <PlayerModal.mobile
      fetchNextVideos={fetchNextPage}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      startIndex={0}
      isLoading={isFetching}
      open={open}
      videos={videos}
      close={close}
    />
  )
}

function LoopDetailsTabShimmer() {
  const videos = [1, 2, 3]
  const videosLength = videos.length
  const transformValues: any = {
    1: [50],
    2: [48, 52],
    3: [46, 50, 54],
  }

  const rightValues: any = {
    1: [20],
    2: [24, 16],
    3: [28, 20, 12],
  }

  const opacitValues: any = {
    1: [1],
    2: [1, 0.5],
    3: [1, 0.66, 0.4],
  }

  return (
    <div className="relative">
      <div className="relative my-4 w-full rounded-lg border border-tertiary-200 bg-monochrome-white">
        <div className="w-[70%] items-center p-[3%]">
          <Shimmer className="h-4 w-2/3" />
          <div className="my-1 flex gap-2">
            <Shimmer className="h-4 w-1/2" />
            <Shimmer className="h-4 w-1/12" />
          </div>
        </div>
        <div className="h-[60%] p-4">
          <div className="flex w-[70%] items-center">
            <div className="relative flex">
              <Shimmer className="z-20 h-6 w-6 rounded-full" />
              <Shimmer className="absolute left-3 z-10 h-6 w-6 rounded-full" />
              <Shimmer className="absolute left-6 h-6 w-6 rounded-full" />
            </div>
            <Shimmer className="ml-7 h-3 w-1/2" />
          </div>
          <Shimmer className="my-1 h-3 w-2/3" />
          <Shimmer className="my-1 h-3 w-2/3" />
          <div className="my-2 flex gap-2">
            <Shimmer className="h-3 w-1/5" />
            <Shimmer className="h-3 w-1/6" />
          </div>
        </div>
      </div>
      {videos.map((item: any, index: number) => (
        <Shimmer
          key={index}
          className="group/video absolute top-[50%] flex aspect-reel h-[80%] items-center justify-center rounded hover:cursor-pointer"
          style={{
            right: `${rightValues[videosLength][index]}px`,
            transform: `translateY(-${transformValues[videosLength][index]}%)`,
            zIndex: videosLength - index + 1,
            opacity: `${opacitValues[videosLength][index]}`,
          }}></Shimmer>
      ))}
    </div>
  )
}
