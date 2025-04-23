import { useId, useMemo, useState } from 'react'
import { getPosts } from './api'
import { Shimmer } from '@/components/shimmer'
import { GeneralError } from '@/components/general-error'
import { CustomImage } from '@/components/custom-image'
import { CustomAvatar } from '@/components/custom-avatar'
import { PlayIcon } from '@/components/icons/play-icon'
import { FeedVideoType } from '@/type'
import type { ComponentProps } from 'react'
import { cn } from '@/utils'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { PlayerModal } from '@/components/player-modal'
import { getQueryKeyForLoopPosts } from '@/utils/constants/keys'
import {
  updateCommentCount,
  updateCommunityJoinStatus,
  updateSparkStatus,
} from '@/utils/react-query/feed'

type PostsPropsType = { slug: string; showTitle?: boolean }

export function Posts({ slug, showTitle = true }: PostsPropsType) {
  const [playerModalIndex, setPlayerModalIndex] = useState(-1)
  const queryKeyForFeed = getQueryKeyForLoopPosts(slug)
  const {
    data: loopPosts,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
  } = getPosts(slug)
  const nextLoaderId = useId()
  useInfiniteScroll(nextLoaderId, fetchNextPage, hasNextPage, isLoading)
  const posts = useMemo(
    () => loopPosts?.pages.flatMap((page) => page.videos),
    [loopPosts],
  )

  // TODO: Handle error here.
  if (isError) return <GeneralError />

  if (isLoading) return <Loader length={8} />

  return (
    <div className='h-full w-full'>
      {showTitle && <p className='mb-1 mt-2 text-title-3-bold'>Posts</p>}
      {!posts || posts.length === 0 ? (
        <NoPosts />
      ) : (
        <div className='mb-2 grid grid-cols-2 gap-4'>
          <PostList
            posts={posts}
            clickOnPost={(index) => {
              setPlayerModalIndex(index)
            }}
          />
        </div>
      )}
      {hasNextPage && (
        <Loader
          id={nextLoaderId}
          length={2}
        />
      )}
      {playerModalIndex !== -1 && (
        <PlayerModal
          onSpark={(videoId, isSparked) => {
            updateSparkStatus(queryKeyForFeed, videoId, isSparked)
          }}
          fetchNextPage={() => fetchNextPage()}
          isLoading={false}
          onCommunityRoleChanged={(communityId, role) => {
            updateCommunityJoinStatus(queryKeyForFeed, communityId, role)
          }}
          onCommentCountChange={(videoId, count) => {
            updateCommentCount(queryKeyForFeed, videoId, count)
          }}
          open={playerModalIndex !== -1}
          videos={posts}
          startIndex={playerModalIndex}
          closeModal={() => {
            setPlayerModalIndex(-1)
          }}
        />
      )}
    </div>
  )
}

type PostListPropsType = {
  posts: FeedVideoType[]
  clickOnPost?: (index: number) => void
}

function PostList({ posts, clickOnPost }: PostListPropsType) {
  return posts.map((post, index) => (
    <div
      key={post.uuid}
      onClick={() => {
        clickOnPost?.(index)
      }}
      className='group/video relative flex aspect-reel w-full items-center justify-center duration-300 hover:cursor-pointer'>
      <CustomImage
        src={post.video.thumbnail_url_l ?? post.video.thumbnail_url}
        alt={post.video.slug}
        className='rounded-xl object-fill h-full w-full absolute inset-0'
      />
      <div className='absolute bottom-2 left-2'>
        <div className='flex h-6 w-6 items-center'>
          <CustomAvatar
            className='h-full w-full bg-red-40'
            imageUrl={post.owner.profile_image_s ?? post.owner.profile_image}
            isAvatar={post.owner.is_avatar}
            fallbackString={post.owner.username}
          />
          <p className='ml-1 text-body-1-bold text-white'>
            @{post.owner.username}
          </p>
        </div>
        {post.video.description_text && (
          <p className='line-clamp-2 w-5/6 overflow-hidden break-all pt-2 text-body-1-med text-white'>
            {post.video.description_text}
          </p>
        )}
        {/* <p className="ml-1 line-clamp-2 text-body-1-demi text-white">{item.video.description}</p> */}
      </div>
      <div className='absolute inset-0  hidden h-full w-full items-center justify-center rounded-lg bg-black/40 group-hover/video:flex'>
        <PlayIcon className='fill-white' />
      </div>
    </div>
  ))
}

type LoaderPropsType = { length: number } & ComponentProps<'div'>
function Loader({ length = 2, className, ...restProps }: LoaderPropsType) {
  return (
    <div
      className={cn('my-4 grid grid-cols-2 gap-4', className)}
      {...restProps}>
      {Array.from({ length }).map((_, index) => (
        <Shimmer
          key={index}
          className='group/video relative flex aspect-reel w-full items-center justify-center'
        />
      ))}
    </div>
  )
}

function NoPosts() {
  return (
    <div className='flex items-center justify-center pt-32 text-title-3-bold'>
      No posts available
    </div>
  )
}
