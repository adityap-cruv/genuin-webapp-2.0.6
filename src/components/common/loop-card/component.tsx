import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type ComponentProps } from 'react'
import { cn, getTimeAgo, abbreviateNumber } from '@lib/utils'
import { CustomAvatar } from '@components/custom/custom-avatar'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import icPlay from '@icons/player-controls/icPlay.svg'

type MessageType = {
  owner: {
    userName: string
  }
  thumbnail: string
  createdAt?: string | null
}

type MemberType = {
  userName: string
  profileImage: string
  isAvatar: boolean
  name: string
}

type Props = ComponentProps<'div'> & {
  /**
   * Name of loop.
   */
  name: string
  /**
   * Id of loop.
   */
  id: string
  description: string
  loopSlug: string
  unreadMessageCount?: number
  isViewAllowed: boolean
  latestMessages: MessageType[]
  memberCount: number
  members: MemberType[]
  viewCount: number
  noOfVideos: number
  latestMessageAt: string | null
  /**
   * This function will get executed when images gets clicked.
   * @param id Here in this function you will get id of loop in parameter
   * @returns Nothing.
   */
  onClickOnImage: (id?: string) => void
  /**
   * Pass this link if you want to redirect user to certain page.
   */
  linkOnImage?: Partial<URL>
}

const TRANSFORM_VALUES = [[50], [48, 52], [46, 50, 54]]

const RIGHT_VALUES = [[20], [24, 16], [28, 20, 12]]

const OPACITY_VALUES = [[1], [1, 0.5], [1, 0.66, 0.4]]

export function Component({
  name,
  id,
  description,
  loopSlug,
  onClickOnImage,
  latestMessages,
  isViewAllowed,
  unreadMessageCount = -1,
  members,
  memberCount,
  viewCount,
  noOfVideos,
  className,
  linkOnImage,
  latestMessageAt,
  ...props
}: Props) {
  const hasUnreadMessages = unreadMessageCount > 0

  return (
    <div className={cn('relative max-h-[210px] max-w-md', className)} {...props}>
      <div className="relative">
        <Link className="relative h-full w-full" href={{ pathname: PATH_NAME.loop(loopSlug) }}>
          <div
            className={cn(
              'relative my-4 h-auto w-full rounded-lg border border-tertiary-200 bg-monochrome-white',
              hasUnreadMessages && 'border-primary-200 bg-primary-100 '
            )}>
            <div className="h-[30%] w-[70%] items-center p-4">
              <p className="line-clamp-1 break-all text-body-1-bold">{name}</p>
              {!isViewAllowed && <p className="text-cap-1-med text-tertiary">Visible to members only</p>}
              {latestMessages.length === 0 ? (
                <p className="line-clamp-1 break-all text-body-1-demi text-secondary-300">
                  @{members[0].userName} created ∙ {getTimeAgo(latestMessageAt)}
                </p>
              ) : hasUnreadMessages ? (
                <p className="line-clamp-1 break-all text-body-1-bold text-primary">{`${unreadMessageCount} new videos ∙ ${getTimeAgo(
                  latestMessages[0].createdAt
                )}`}</p>
              ) : (
                !hasUnreadMessages &&
                isViewAllowed && (
                  <p className="line-clamp-1 break-all text-body-1-demi text-secondary-300">
                    @{members[0].userName} posted ∙ {getTimeAgo(latestMessages[0].createdAt)}
                  </p>
                )
              )}
            </div>
            <div
              className={cn(
                'h-[60%] rounded-b-lg border border-tertiary-200 p-4',
                hasUnreadMessages ? 'bg-primary-200' : 'bg-tertiary-200'
              )}>
              <div className="w-[70%]">
                <div className="flex items-center">
                  <div className={`relative flex ${members.length > 1 ? 'space-x-[-10px]' : ''}`}>
                    {members.map((item, index) => (
                      <CustomAvatar
                        key={index}
                        className={`z-[${index * 5}] h-6 w-6 border-2 border-tertiary-100 bg-red-50`}
                        imageUrl={item.profileImage}
                        isAvatar={item.isAvatar}
                        fallbackString={item.name}
                      />
                    ))}
                  </div>
                  {members.length > 0 && (
                    <p className={`ml-1 line-clamp-1 text-body-1-med text-secondary-300`}>
                      {`${members[0].userName} ${
                        members.length - 1 !== 0
                          ? members.length - 1 === 1
                            ? '+1 Other'
                            : `+${abbreviateNumber(members.length - 1)} Others`
                          : ''
                      }`}
                    </p>
                  )}
                </div>
                <p className="my-2 line-clamp-2 h-10 text-body-1-demi text-secondary-300">{description}</p>
                <p className="text-body-1-med text-secondary-300">
                  {abbreviateNumber(noOfVideos)} posts ∙{abbreviateNumber(viewCount)} views
                </p>
              </div>
            </div>
          </div>
        </Link>
        {!isViewAllowed && (
          <div className="group/video absolute right-7 top-[50%] flex aspect-reel h-[80%] -translate-y-1/2 items-center justify-center rounded border border-secondary-300 bg-monochrome-white hover:cursor-pointer">
            <div className="bg-secondary-200 rounded-full p-2">
              <Image src={icLock} alt="share" className="h-4 w-4" />
            </div>
          </div>
        )}
        {isViewAllowed &&
          latestMessages.map((item, index) => {
            return (
              <Link
                href={linkOnImage ?? ''}
                key={index}
                onClick={(e) => {
                  if (!linkOnImage) {
                    e.preventDefault()
                    onClickOnImage(id)
                  }
                }}
                className="group/video absolute top-1/2 flex aspect-reel h-[80%] items-center justify-center rounded hover:cursor-pointer"
                style={{
                  right: `${RIGHT_VALUES[latestMessages.length - 1][index]}px`,
                  transform: `translateY(-${TRANSFORM_VALUES[latestMessages.length - 1][index]}%)`,
                  zIndex: latestMessages.length - index + 1,
                  opacity: `${OPACITY_VALUES[latestMessages.length - 1][index]}`,
                }}>
                <img className="aspect-reel rounded" src={item.thumbnail} />
                <div className="absolute inset-0 hidden h-full w-full items-center justify-center bg-monochrome-black/30 group-hover/video:flex">
                  <Image src={icPlay} alt="play" className="absolute" />
                </div>
              </Link>
            )
          })}
        {isViewAllowed && latestMessages.length === 0 && (
          <div className="group/video absolute right-5 top-[50%] flex aspect-reel h-[80%] -translate-y-1/2 items-center justify-center rounded border border-monochrome-black/20 bg-monochrome-white hover:cursor-pointer">
            <div className="bg-secondary-200 rounded-full p-2 ">
              <p className="ml-1 line-clamp-1  text-cap-2-demi text-tertiary-400 "> No posts yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
