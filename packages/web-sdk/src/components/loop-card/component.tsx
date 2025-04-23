import { usePathNameWithSubdomain } from '@/hooks/usePathNameWithSubdomain'
import { type ComponentProps } from 'react'
import { cn, getTimeAgo, abbreviateNumber } from '@/utils'
import { CustomAvatar } from '../custom-avatar'
import { LockIcon } from '../icons/lock-icon'
import { PlayIcon } from '../icons/play-icon'
import { CustomImage } from '../custom-image'
import type { MemberType, MessageType } from './type'
import { CustomLink } from '@/router/custom-link'

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
  linkOnImage?: string
}

const TRANSFORM_VALUES = [[50], [48, 52], [46, 50, 54]]

const RIGHT_VALUES = [[20], [24, 16], [28, 20, 12]]

const OPACITY_VALUES = [[1], [1, 0.5], [1, 0.66, 0.4]]

// TODO: Separate out this component into smaller components.
export function LoopCard({
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
  const pathName = usePathNameWithSubdomain()
  const hasUnreadMessages = unreadMessageCount > 0

  return (
    <div
      key={id}
      className={cn('relative max-h-[210px]', className)}
      {...props}>
      <CustomLink href={pathName.loop(loopSlug)}>
        <div
          className={cn(
            'h-full w-full rounded-lg border border-tertiary-200 bg-background',
            hasUnreadMessages && 'border-primary-200 bg-primary-100 ',
          )}>
          <div
            style={{ height: '35%', width: '70%' }}
            className='p-4'>
            <p className='line-clamp-1 break-all text-body-1-demi sm:text-title-3-demi'>
              {name}
            </p>
            {!isViewAllowed && (
              <p className='text-cap-1-med text-tertiary'>
                Visible to members only
              </p>
            )}
            {latestMessages.length === 0 ? (
              <p className='line-clamp-1 break-all text-body-1-demi text-secondary-300'>
                @{members[0].userName} created ∙ {getTimeAgo(latestMessageAt)}
              </p>
            ) : hasUnreadMessages ? (
              <p className='line-clamp-1 break-all text-body-1-bold text-primary'>{`${unreadMessageCount} new videos ∙ ${getTimeAgo(
                latestMessages[0].createdAt,
              )}`}</p>
            ) : (
              !hasUnreadMessages &&
              isViewAllowed && (
                <p className='line-clamp-1 break-all text-body-1-demi text-secondary-300'>
                  @{members[0].userName} posted ∙{' '}
                  {getTimeAgo(latestMessages[0].createdAt)}
                </p>
              )
            )}
          </div>
          <div
            style={{ height: '65%' }}
            className={cn(
              'rounded-b-lg border border-tertiary-200 p-4',
              hasUnreadMessages ? 'bg-primary-200' : 'bg-tertiary-200',
            )}>
            <div style={{ width: '70%' }}>
              <div className='flex items-center'>
                <div
                  className={`relative flex ${members.length > 1 ? 'space-x-[-10px]' : ''}`}>
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
                  <p
                    className={`ml-1 line-clamp-1 text-body-1-med text-secondary-300`}>
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
              <p className='my-2 line-clamp-2 h-10 text-body-1-demi text-secondary-300'>
                {description}
              </p>
              <p className='text-body-1-med text-secondary-300'>
                {abbreviateNumber(noOfVideos)} posts ∙
                {abbreviateNumber(viewCount)} views
              </p>
            </div>
          </div>
        </div>
      </CustomLink>
      {!isViewAllowed && (
        <div className='group/video absolute right-7 top-[50%] flex aspect-reel h-[80%] -translate-y-1/2 items-center justify-center rounded border border-secondary-300 bg-background hover:cursor-pointer'>
          <div className='bg-secondary-200 rounded-full p-2'>
            <LockIcon className='h-4 w-4' />
          </div>
        </div>
      )}
      {isViewAllowed &&
        latestMessages.map((item, index) => {
          return (
            <div
              key={index}
              onClick={(e) => {
                if (!linkOnImage) {
                  e.preventDefault()
                  onClickOnImage?.()
                }
              }}
              className='group/video absolute top-1/2 flex aspect-reel items-center justify-center rounded hover:cursor-pointer'
              style={{
                height: '75%',
                right: `${RIGHT_VALUES[latestMessages.length - 1][index]}px`,
                transform: `translateY(-${TRANSFORM_VALUES[latestMessages.length - 1][index]}%)`,
                zIndex: latestMessages.length - index + 1,
                opacity: `${OPACITY_VALUES[latestMessages.length - 1][index]}`,
              }}>
              <CustomImage
                className='aspect-reel rounded object-fill h-full w-full'
                src={item.thumbnail}
                alt='video image'
              />
              <div className='absolute inset-0 hidden h-full w-full items-center justify-center bg-black/30 group-hover/video:flex'>
                <PlayIcon className='h-4 w-4' />
              </div>
            </div>
          )
        })}
      {isViewAllowed && latestMessages.length === 0 && (
        <div className='group/video absolute right-5 top-[50%] flex aspect-reel h-[80%] -translate-y-1/2 items-center justify-center rounded border border-black/20 bg-background hover:cursor-pointer'>
          <div className='bg-secondary-200 rounded-full p-2 '>
            <p className='ml-1 line-clamp-1  text-cap-2-demi text-tertiary-400 '>
              No posts yet
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
