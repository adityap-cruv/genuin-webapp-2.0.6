import { CustomAvatar } from '@components/custom/custom-avatar'
import { Loader } from '@components/ui/loader'
import { getCommunityLoops } from '@lib/api/community'
import { abbreviateNumber, getTimeAgo } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import Image from 'next/image'
import Link from 'next/link'
import noLoopsImage from '@images/noLoopImage.svg'
import icPlay from '@icons/player-controls/icPlay.svg'
import { useState } from 'react'

export function CommunityLoopTab({ communitySlug }: { communitySlug: string }) {
  const { data: loops, isLoading } = getCommunityLoops(communitySlug)
  if (isLoading) return <Loader size="sm" />

  if (loops && loops.length === 0)
    return (
      <div className="flex h-1/2">
        <div className="mt-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
          <Image src={noLoopsImage} alt="share" />
          <p className="text-title-2-bold">No Loops... yet!</p>
          <p className="w-[80%] text-center text-body-1-demi text-monochrome">
            Loops are dynamic discussion spaces centered around specific themes. Members can share videos, get
            reactions, and enjoy engaging comments from the community.
          </p>
        </div>
      </div>
    )

  if (loops && loops.length !== 0)
    return (
      <div>
        {loops.map((item: any, index: number) => {
          return <LoopItem key={index} loopDetails={item} />
        })}
      </div>
    )
}

function LoopItem({ loopDetails }: { loopDetails: any }) {
  const [hovered, setHovered] = useState<boolean | null>(null)
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
  // TODO on video click open video
  const videosLength = loopDetails.videos.length
  const renderedImages = loopDetails.videos.map((item: any, index: any) => (
    <div
      key={index}
      className="absolute top-[50%] flex aspect-reel h-[80%] items-center justify-center rounded"
      style={{
        right: `${rightValues[videosLength][index]}px`,
        transform: `translateY(-${transformValues[videosLength][index]}%)`,
        zIndex: videosLength - index + 1,
        opacity: `${opacitValues[videosLength][index]}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
      }}>
      <img
        className="rounded"
        // onError={(e) => {
        //   e.target.src = icPreviewImage.src
        // }}
        src={item.thumbnail}
        alt={index}
        style={{ filter: hovered ? 'brightness(60%)' : 'brightness(100%)' }}
      />
      {hovered && <Image src={icPlay} alt="play" className="absolute" />}
    </div>
  ))
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
    <a href={PATH_NAME.loop(loopDetails.slug)}>
      <div className="py-2">
        <div className="relative w-full rounded-lg border border-monochrome-9 bg-monochrome-white">
          <div className="w-[70%] items-center p-[3%]">
            <p className="text-body-1-bold">{loopDetails.name}</p>
            {loopDetails.videos.length !== 0 && (
              <p className="text-body-1-demi text-monochrome-4">
                {loopDetails.videos[0].owner} posted ∙ {getTimeAgo(loopDetails.videos[0].created_at)}
              </p>
            )}
          </div>
          <div className="h-[60%] rounded-b-lg border border-monochrome-8 p-4" style={{ backgroundColor: '#F9F9F9' }}>
            <div className="flex w-[68%] items-center">
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
            <p className="my-[2%] line-clamp-2 w-[68%] text-body-1-demi text-monochrome-4">{loopDetails.description}</p>
            <p className="w-[68%] text-body-1-med text-monochrome-4" style={{ fontWeight: 500 }}>
              {abbreviateNumber(loopDetails.subscriber_count)} subscribers ∙ {abbreviateNumber(loopDetails.view_count)}{' '}
              views
            </p>
          </div>
          {renderedImages}
        </div>
      </div>
    </a>
  )
}
