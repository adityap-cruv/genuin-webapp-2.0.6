import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'
import { type ComponentProps } from 'react'
import { cn, getTimeAgo, abbreviateNumber } from '@lib/utils'
import { CustomAvatar } from '@components/custom/custom-avatar'
import Image from 'next/image'
import icLock from '@icons/icLock.svg'
import icPlay from '@icons/player-controls/icPlay.svg'
import { CustomImage } from '@/components/custom/custom-image'
import { PinIcon } from '@icons/pin-icon'

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
  position?: number | null
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
  position,
  ...props
}: Props) {
  const hasUnreadMessages = unreadMessageCount > 0

  return (
    <div className={cn('relative max-h-[250px]', className)} {...props}>
      <div className="relative">
        <Link className="relative h-full w-full" href={{ pathname: PATH_NAME.loop(loopSlug) }}>
          <div
            className={cn(
              'border-tertiary-200 bg-monochrome-white relative my-4 h-auto w-full rounded-lg border',
              hasUnreadMessages && 'border-primary-200 bg-primary-100'
            )}>
            <div className="h-[30%] w-[70%] items-center p-4">
              {position && (
                <div className="mb-1.5 flex items-center gap-1">
                  <PinIcon className="fill-tertiary" />
                  <span className="text-cap-1-demi text-tertiary line-clamp-1 break-words">Pinned by admin</span>
                </div>
              )}
              <p className="text-body-1-demi sm:text-title-3-demi line-clamp-2 break-words">{name}</p>
              {!isViewAllowed && <p className="text-cap-1-med text-tertiary">Visible to members only</p>}
              {latestMessages.length === 0 ? (
                <p className="text-body-1-demi text-secondary-300 line-clamp-1 break-all">
                  @{members[0]?.userName} created ∙ {getTimeAgo(latestMessageAt)}
                </p>
              ) : hasUnreadMessages ? (
                <p className="text-body-1-bold text-primary line-clamp-1 break-all">{`${unreadMessageCount} new videos ∙ ${getTimeAgo(
                  latestMessages[0]?.createdAt ?? latestMessageAt
                )}`}</p>
              ) : (
                !hasUnreadMessages &&
                isViewAllowed && (
                  <p className="text-body-1-demi text-secondary-300 line-clamp-1 break-all">
                    @{members[0]?.userName} posted ∙ {getTimeAgo(latestMessages[0]?.createdAt)}
                  </p>
                )
              )}
            </div>
            <div
              className={cn(
                'border-tertiary-200 h-[60%] rounded-b-lg border p-4',
                hasUnreadMessages ? 'bg-primary-200' : 'bg-tertiary-200'
              )}>
              <div className="w-[70%]">
                <div className="flex items-center">
                  <div className={`relative flex ${members.length > 1 ? 'space-x-[-10px]' : ''}`}>
                    {members.map((item, index) => (
                      <CustomAvatar
                        key={index}
                        className={`z-[${index * 5}] border-tertiary-100 h-6 w-6 border-2 bg-red-50`}
                        imageUrl={item.profileImage}
                        isAvatar={item.isAvatar}
                        fallbackString={item.name}
                      />
                    ))}
                  </div>
                  {members.length > 0 && (
                    <p className={`text-body-1-med text-secondary-300 ml-1 line-clamp-1`}>
                      {`${members[0]?.userName} ${
                        members.length - 1 !== 0
                          ? members.length - 1 === 1
                            ? '+1 Other'
                            : `+${abbreviateNumber(members.length - 1)} Others`
                          : ''
                      }`}
                    </p>
                  )}
                </div>
                <p className="text-body-1-demi text-secondary-300 my-2 line-clamp-2 h-10">{description}</p>
                <p className="text-body-1-med text-secondary-300">
                  {abbreviateNumber(noOfVideos)} posts ∙{abbreviateNumber(viewCount)} views
                </p>
              </div>
            </div>
          </div>
        </Link>
        {!isViewAllowed && (
          <div className="group/video aspect-reel border-secondary-300 bg-monochrome-white absolute top-[50%] right-7 flex h-[80%] -translate-y-1/2 items-center justify-center rounded border hover:cursor-pointer">
            <div className="bg-secondary-200 rounded-full p-2">
              <Image src={icLock} alt="share" className="h-4 w-4" height={16} width={16} />
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
                className="group/video aspect-reel absolute top-1/2 flex h-[80%] items-center justify-center rounded hover:cursor-pointer"
                style={{
                  right: `${RIGHT_VALUES[latestMessages.length - 1]?.[index] ?? 20}px`,
                  transform: `translateY(-${TRANSFORM_VALUES[latestMessages.length - 1]?.[index] ?? 50}%)`,
                  zIndex: latestMessages.length - index + 1,
                  opacity: `${OPACITY_VALUES[latestMessages.length - 1]?.[index] ?? 1}`,
                }}>
                <CustomImage fill className="aspect-reel rounded" src={item.thumbnail} alt="video image" />
                <div className="bg-monochrome-black/30 absolute inset-0 hidden h-full w-full items-center justify-center group-hover/video:flex">
                  <Image src={icPlay} alt="play" className="absolute" height={24} width={24} />
                </div>
              </Link>
            )
          })}
        {isViewAllowed && latestMessages.length === 0 && (
          <div className="group/video aspect-reel border-monochrome-black/20 bg-monochrome-white absolute top-[50%] right-5 flex h-[80%] -translate-y-1/2 items-center justify-center rounded border hover:cursor-pointer">
            <div className="bg-secondary-200 rounded-full p-2">
              <p className="text-cap-2-demi text-tertiary-400 ml-1 line-clamp-1"> No posts yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
