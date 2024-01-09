import { CustomAvatar } from '@components/custom/custom-avatar'
import { Loader } from '@components/ui/loader'
import { getCommunityLoops } from '@lib/api/community'
import { abbreviateNumber, getTimeAgo } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import Image from 'next/image'
import Link from 'next/link'
import noLoopsImage from '@images/noLoopImage.svg'
import icPlay from '@icons/player-controls/icPlay.svg'
import { PlayerModal } from '@components/common/modals/player-modal'
import { getLoopVideos } from '@lib/api/loop'
import { useState } from 'react'

// TODO: remove this component from here and put at better location
// TODO: improve player-modal opening logic. As not meeting standards.
export function CommunityLoopTab({ communitySlug }: { communitySlug: string }) {
  const { isLoading, data: loops } = getCommunityLoops(communitySlug)
  const [modalController, setModalController] = useState({ open: false, loopSlug: '' })

  if (isLoading) return <Loader size="sm" />
  if (loops.length === 0) return <NoLoops />
  if (loops)
    return (
      <>
        {loops.map((item: any, index: number) => (
          <LoopItem
            key={index}
            loopDetails={item}
            openModal={(slug) => {
              setModalController((x) => {
                x.loopSlug = slug
                x.open = true
                return { ...x }
              })
            }}
          />
        ))}
        <PlayerModalWrapper
          open={modalController.open}
          loopSlug={modalController.loopSlug}
          close={() => {
            setModalController((x) => {
              x.open = false
              return { ...x }
            })
          }}
        />
      </>
    )
}

function NoLoops() {
  return (
    <div className="flex h-full flex-col items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
      <Image src={noLoopsImage} alt="share" />
      <p className="text-title-2-bold">No Loops... yet!</p>
      <p className="w-[80%] text-center text-body-1-demi text-monochrome">
        Loops are dynamic discussion spaces centered around specific themes. Members can share videos, get reactions,
        and enjoy engaging comments from the community.
      </p>
    </div>
  )
}

function LoopItem({ loopDetails, openModal }: { loopDetails: any; openModal: (slug: string) => void }) {
  function getCollaboratorsCountString(count: any) {
    let str = ' + '
    if (!count) return
    if (count === 1) {
      str += count + ' collaborator'
    } else {
      str += count + ' collaborators'
    }
    return str
  }

  return (
    <div className="relative">
      <Link href={{ pathname: PATH_NAME.loop(loopDetails.slug) }}>
        <div className="relative my-4 w-full rounded-lg border border-monochrome-9 bg-monochrome-white">
          <div className="w-[70%] items-center p-[3%]">
            <p className="text-body-1-bold">{loopDetails.name}</p>
            {loopDetails.videos.length !== 0 && (
              <p className="text-body-1-demi text-monochrome-4">
                {loopDetails.videos[0].owner} posted ∙ {getTimeAgo(loopDetails.videos[0].created_at)}
              </p>
            )}
          </div>
          <div className="h-[60%] rounded-b-lg border border-monochrome-8 p-4" style={{ backgroundColor: '#F9F9F9' }}>
            <div className="flex w-[70%] items-center">
              <div className="relative flex">
                {loopDetails.owner.profile_image && (
                  <CustomAvatar
                    className="z-20 h-6 w-6 border-2 border-monochrome-white bg-red-50"
                    imageUrl={loopDetails.owner.profile_image ?? ''}
                    isAvatar={loopDetails.owner.is_avatar}
                    fallbackString={loopDetails.owner.name ?? ''}
                  />
                )}
                {loopDetails.collaborators.length !== 0 && loopDetails.collaborators[0] && (
                  <CustomAvatar
                    className="absolute left-3 z-10 h-6 w-6 border-2 border-monochrome-white bg-red-50"
                    imageUrl={loopDetails.collaborators[0].profile_image ?? ''}
                    isAvatar={loopDetails.collaborators[0].is_avatar}
                    fallbackString={loopDetails.collaborators[0].nickname ?? ''}
                  />
                )}
                {loopDetails.collaborators.length !== 0 && loopDetails.collaborators[1] && (
                  <CustomAvatar
                    className="absolute left-6 h-6 w-6 border-2 border-monochrome-white bg-red-50"
                    imageUrl={loopDetails.collaborators[1].profile_image ?? ''}
                    isAvatar={loopDetails.collaborators[1].is_avatar}
                    fallbackString={loopDetails.collaborators[1].nickname ?? ''}
                  />
                )}
              </div>
              <p
                className={`ml-1 line-clamp-1 text-body-1-med text-monochrome-4 ${
                  loopDetails.collaborators.length !== 0 && 'ml-7'
                } ${loopDetails.collaborators.length === 2 && 'ml-6'}`}
                style={{ fontWeight: 500 }}>
                {loopDetails.owner.nickname}
                {getCollaboratorsCountString(loopDetails.member_count - 1)}
              </p>
            </div>
            <p className="my-[2%] line-clamp-2 w-[70%] text-body-1-demi text-monochrome-4">{loopDetails.description}</p>
            <p className="w-[70%] text-body-1-med text-monochrome-4" style={{ fontWeight: 500 }}>
              {abbreviateNumber(loopDetails.subscriber_count)} subscribers ∙ {abbreviateNumber(loopDetails.view_count)}{' '}
              views
            </p>
          </div>
        </div>
      </Link>
      <RenderedImages
        videos={loopDetails.videos}
        onClick={() => {
          openModal(loopDetails.slug)
        }}
      />
    </div>
  )
}

function RenderedImages({ videos, onClick }: { videos: any[]; onClick: () => void }) {
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
    <span onClick={onClick}>
      {videos.map((item: any, index: number) => (
        <div
          key={index}
          className="group/video absolute top-[50%] flex aspect-reel h-[80%] items-center justify-center rounded hover:cursor-pointer"
          style={{
            right: `${rightValues[videosLength][index]}px`,
            transform: `translateY(-${transformValues[videosLength][index]}%)`,
            zIndex: videosLength - index + 1,
            opacity: `${opacitValues[videosLength][index]}`,
          }}>
          <img className="rounded" src={item.thumbnail} />
          <div className="absolute inset-0 hidden h-full w-full items-center justify-center bg-monochrome-black/30 group-hover/video:flex">
            <Image src={icPlay} alt="play" className="absolute" />
          </div>
        </div>
      ))}
    </span>
  )
}

type PlayerModalWrapperProps = {
  open: boolean
  loopSlug: string
  close: () => void
}

function PlayerModalWrapper({ open = false, loopSlug, close }: PlayerModalWrapperProps) {
  const { data, fetchNextPage, isError, isFetchingNextPage, isFetching } = getLoopVideos(loopSlug)
  const videos = data?.pages.flatMap((item) => item.videos)

  return (
    <PlayerModal.desktop
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
