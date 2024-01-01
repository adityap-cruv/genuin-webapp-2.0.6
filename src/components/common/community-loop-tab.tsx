import { CustomAvatar } from '@components/custom/custom-avatar'
import { Loader } from '@components/ui/loader'
import { getCommunityLoops } from '@lib/api/community'
import { abbreviateNumber, getTimeAgo } from '@lib/utils'
import { PATH_NAME } from '@lib/utils/constants/path'
import Image from 'next/image'
import Link from 'next/link'
import noLoopsImage from '@images/noLoopImage.svg'

export default function LoopTab({ communityHandle }: { communityHandle: string }) {
  const { isLoading, data: loops, isFetched } = getCommunityLoops(communityHandle)

  return (
    <div className='h-full'>
      {isLoading && <Loader size="sm" />}
      {isFetched && (
        <>
          {loops.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#F9F9F9' }}>
              <Image src={noLoopsImage} alt="share" />
              <p className="text-title-2-bold">No Loops... yet!</p>
              <p className="w-96 text-center text-body-1-demi text-monochrome">
                Loops are dynamic discussion spaces centered around specific themes. Members can share videos, get
                reactions, and enjoy engaging comments from the community.
              </p>
            </div>
          ) : (
            loops.map((item: any, index: number) => {
              return <LoopItem key={index} loopDetails={item} />
            })
          )}
        </>
      )}
    </div>
  )
}

function LoopItem({ loopDetails }: { loopDetails: any }) {
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
    <img
      key={index}
      className="absolute top-[50%] aspect-reel h-[80%] rounded"
      style={{
        right: `${rightValues[videosLength][index]}px`,
        transform: `translateY(-${transformValues[videosLength][index]}%)`,
        zIndex: videosLength - index + 1,
        opacity: `${opacitValues[videosLength][index]}`,
      }}
      // onError={(e) => {
      //   e.target.src = icPreviewImage.src
      // }}
      src={item.thumbnail}
      alt={index}
    />
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
    <Link href={{ pathname: PATH_NAME.loop(loopDetails.share_string) }}>
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
        {renderedImages}
      </div>
    </Link>
  )
}
