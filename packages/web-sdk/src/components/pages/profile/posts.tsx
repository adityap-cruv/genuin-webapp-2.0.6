import { cn } from '@/utils'
import {
  TreeStructure,
  CommunitiesNode,
  CommunityItem,
  LoopNode,
  LoopItem,
  VideoItem,
  VideosNode,
  type LoopType,
  type VideoType,
  type TreeStructurePropsType,
  getVideoLimit,
} from '@/components/tree-structure'
import {
  fetchProfileFeed,
  fetchProfileLoops,
  fetchProfileCommunities,
  fetchProfileVideos,
} from './api/posts'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useSizeContext } from '@/context/size'
import { useTreeStructure } from '@/components/tree-structure/context'
import {
  getQueryKeyForProfileCommunities,
  getQueryKeyForProfileFeed,
  getQueryKeyForProfileLoops,
  getQueryKeyForProfileVideos,
} from '@/utils/constants/keys'
import { PlayerModal } from '@/components/player-modal'
import {
  updateCommentCount,
  updateCommunityJoinStatus,
  updateSparkStatus,
} from '@/utils/react-query/feed'
import { updateCommunityUserRoleForProfileCommunities } from './utils'

type BasePropsType = {
  profileId: string
  /**
   * As we are using profile components for brand and profile both. We need pass this prop to all apis to define their path and decide the api url.
   * @default false
   */
  forBrand: boolean
}

type PostsPropsType = TreeStructurePropsType & BasePropsType

export function Posts({
  profileId,
  className,
  forBrand = false,
  forEmbed,
  isSelfUser,
}: PostsPropsType) {
  return (
    <TreeStructure
      className={cn(className)}
      forEmbed={forEmbed}
      isSelfUser={isSelfUser}>
      <Ui
        profileId={profileId}
        forBrand={forBrand}
      />
    </TreeStructure>
  )
}

function Ui({ profileId, forBrand }: BasePropsType) {
  const { activeVideoId } = useTreeStructure()
  const { isMobile } = useSizeContext()
  const { data: communitiesData, ...queryResult } = useInfiniteQuery({
    queryFn: async ({ pageParam }) =>
      fetchProfileCommunities({
        profileId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam.lastCommunityId, isMobile),
        forBrand,
      }),
    queryKey: getQueryKeyForProfileCommunities(profileId, forBrand),
    initialPageParam: { lastCommunityId: '', pageSession: '' },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null
      return lastPage.nextPageParam
    },
  })
  const communities = useMemo(
    () => communitiesData?.pages.flatMap((page) => page.communities),
    [communitiesData],
  )

  return (
    <>
      <CommunitiesNode
        communities={communities}
        queryResult={queryResult}>
        {communities?.map((community) => (
          <CommunityItem
            communityDetails={community}
            key={community.id}
            onCommunityRoleChanged={(newRole) => {
              updateCommunityUserRoleForProfileCommunities(
                profileId,
                forBrand,
                community.id,
                newRole,
              )
            }}
            className='my-4'>
            <Loops
              communityId={community.id}
              initialLoops={community.loops}
              totalLoops={community.totalLoops}
              profileId={profileId}
              forBrand={forBrand}
            />
          </CommunityItem>
        ))}
      </CommunitiesNode>
      {activeVideoId && (
        <PlayerModalWrapper
          profileId={profileId}
          forBrand={forBrand}
        />
      )}
    </>
  )
}

type LoopsPropsType = {
  initialLoops: Array<LoopType>
  communityId: string
  totalLoops: number
} & BasePropsType

function Loops({
  communityId,
  initialLoops,
  profileId,
  totalLoops,
  forBrand,
}: LoopsPropsType) {
  const { isMobile } = useSizeContext()
  const { data: loopsData, ...queryResult } = useInfiniteQuery({
    queryFn: ({ pageParam }) =>
      fetchProfileLoops({
        profileId,
        communityId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam?.lastLoopId, isMobile),
        forBrand,
      }),
    initialPageParam: {
      lastLoopId: initialLoops[initialLoops.length - 1]?.id,
      pageSession: '',
    },
    initialData: {
      pageParams: [{ lastLoopId: '', pageSession: '' }],
      pages: [
        {
          loops: initialLoops,
          nextPageParam: {
            lastLoopId: initialLoops[initialLoops.length - 1]?.id,
            pageSession: '',
          },
          end: false,
        },
      ],
    },
    queryKey: getQueryKeyForProfileLoops(communityId, forBrand),
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null
      return lastPage.nextPageParam
    },
    enabled: false,
  })

  const loops = useMemo(
    () => loopsData?.pages.flatMap((page) => page.loops),
    [loopsData],
  )

  return (
    <LoopNode
      availableLoopCount={loops.length}
      totalLoopCount={totalLoops}
      queryResult={queryResult}>
      {loops?.map((loop) => {
        return (
          <LoopItem
            loopDetails={loop}
            key={loop.id}>
            <Videos
              initialVideos={loop.videos}
              communityId={communityId}
              loopId={loop.id}
              totalVideos={loop.totalVideoCount}
              profileId={profileId}
              forBrand={forBrand}
            />
          </LoopItem>
        )
      })}
    </LoopNode>
  )
}

type VideoPropsType = {
  initialVideos: VideoType[]
  loopId: string
  communityId: string
  totalVideos: number
} & BasePropsType

function Videos({
  initialVideos,
  loopId,
  communityId,
  totalVideos,
  profileId,
  forBrand,
}: VideoPropsType) {
  const { openPlayerModal } = useTreeStructure()
  const { isMobile } = useSizeContext()

  const { data: videosData, ...queryResult } = useInfiniteQuery({
    queryKey: getQueryKeyForProfileVideos(communityId, loopId, forBrand),
    queryFn: ({ pageParam }) =>
      fetchProfileVideos({
        profileId,
        loopId,
        pageParam,
        communityId,
        videosLimit: getVideoLimit(!!pageParam?.lastVideoId, isMobile),
        forBrand,
      }),
    initialPageParam: {
      lastVideoId: initialVideos[initialVideos.length - 1]?.id,
      pageSession: '',
    },
    initialData: {
      pageParams: [
        {
          lastVideoId: initialVideos[initialVideos.length - 1]?.id,
          pageSession: '',
        },
      ],
      pages: [
        {
          videos: initialVideos,
          end: false,
          nextPageParam: {
            lastVideoId: initialVideos[initialVideos.length - 1]?.id,
            pageSession: '',
          },
        },
      ],
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null
      return lastPage.nextPageParam
    },
    enabled: false,
  })

  const videos = useMemo(
    () => videosData.pages.flatMap((page) => page.videos),
    [videosData],
  )

  return (
    <VideosNode
      availableVideosCount={videos.length}
      totalVideoCount={totalVideos}
      queryResult={queryResult}>
      {videos?.map((video) => {
        return (
          <VideoItem
            key={video.id}
            videoDetails={video}
            onClick={() => {
              openPlayerModal?.(video.id)
            }}
          />
        )
      })}
    </VideosNode>
  )
}

// TODO: this implementation is only for web-sdk. I haven't thought about web-application yet.
// Will be moving this component to tree structure soon.
function PlayerModalWrapper({ profileId, forBrand }: BasePropsType) {
  const { activeVideoId: videoId, closePlayerModal } = useTreeStructure()
  const queryKeyForFeed = getQueryKeyForProfileFeed(
    profileId,
    forBrand,
    videoId,
  )

  const {
    data: videosData,
    isLoading,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeyForFeed,
    queryFn: ({ pageParam }) => {
      // Only use fromVideoId for the first page when pageParam is undefined
      if (!pageParam.lastMessageId) {
        return fetchProfileFeed(profileId, forBrand, undefined, videoId)
      }
      // For subsequent pages, use lastMessageId from pageParam
      return fetchProfileFeed(profileId, forBrand, pageParam, undefined)
    },
    initialPageParam: { lastMessageId: '' },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) {
        return undefined // Return undefined to indicate no more pages
      }
      // Get the last video ID from the current page
      const lastVideo = lastPage.videos[lastPage.videos.length - 1]
      return lastVideo ? { lastMessageId: lastVideo.uuid } : undefined
    },
  })

  const videos = useMemo(() => {
    return videosData?.pages.flatMap((page) => page.videos)
  }, [videosData])

  return (
    <PlayerModal
      onSpark={(videoId, isSparked) => {
        updateSparkStatus(queryKeyForFeed, videoId, isSparked)
      }}
      closeModal={closePlayerModal}
      fetchNextPage={() => fetchNextPage()}
      isLoading={isLoading}
      onCommunityRoleChanged={(communityId, newRole) => {
        updateCommunityJoinStatus(queryKeyForFeed, communityId, newRole)
        updateCommunityUserRoleForProfileCommunities(
          profileId,
          forBrand,
          communityId,
          newRole,
        )
      }}
      open={!!videoId}
      videos={videos}
      onCommentCountChange={(videoId, count) => {
        updateCommentCount(queryKeyForFeed, videoId, count)
      }}
    />
  )
}
