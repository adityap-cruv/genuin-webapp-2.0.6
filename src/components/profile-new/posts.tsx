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
  type CommunityUserRole,
} from '@/components/tree-structure'
import { useMemo } from 'react'
import { useTreeStructure } from '@/components/tree-structure/context'
import {
  getQueryKeyForProfileCommunities,
  getQueryKeyForProfileFeed,
  getQueryKeyForProfileLoops,
  getQueryKeyForProfileVideos,
} from '@/lib/utils/react-query/keys'
// import { updateCommentCount, updateCommunityJoinStatus, updateSparkStatus } from '@/lib/utils/react-query/feed'
import { updateCommunityUserRoleForProfileCommunities } from '@components/profile-new/utils'
import { cn } from '@/lib/utils'
import { useGenuinOptions } from '@/lib/stores/genuin-options'
import { fetchProfileCommunities, fetchProfileFeed, fetchProfileLoops, fetchProfileVideos } from '../../lib/api/profile'
import { useInfiniteQuery } from '@tanstack/react-query'
import { PlayerModal } from '../common/feed/player-modal'

type BasePropsType = {
  profileId: string
  /**
   * As we are using profile components for brand and profile both. We need pass this prop to all apis to define their path and decide the api url.
   * @default false
   */
  forBrand: boolean
}

type PostsPropsType = TreeStructurePropsType & BasePropsType

export function Posts({ profileId, className, forBrand = false, ...restProps }: PostsPropsType) {
  return (
    <TreeStructure className={cn(className)} {...(restProps as Omit<React.HTMLAttributes<HTMLDivElement>, 'ref'>)}>
      <Ui profileId={profileId} forBrand={forBrand} />
    </TreeStructure>
  )
}

function Ui({ profileId, forBrand }: BasePropsType) {
  const { activeVideoId } = useTreeStructure()
  const { isMobile } = useGenuinOptions()
  const { data: communitiesData, ...queryResult } = useInfiniteQuery({
    queryKey: getQueryKeyForProfileCommunities(profileId, forBrand),
    queryFn: async ({ pageParam = { lastCommunityId: '', pageSession: '' } }) =>
      await fetchProfileCommunities({
        profileId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam.lastCommunityId, isMobile),
        forBrand,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null
      return lastPage.nextPageParam
    },
  })
  const communities = useMemo(() => communitiesData?.pages.flatMap((page) => page.communities), [communitiesData])

  return (
    <>
      <CommunitiesNode communities={communities} queryResult={queryResult}>
        {communities?.map((community) => (
          <CommunityItem
            communityDetails={community}
            key={community.id}
            onCommunityRoleChanged={(newRole) => {
              updateCommunityUserRoleForProfileCommunities(profileId, forBrand, community.id, newRole)
            }}
            className="my-4">
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
      {activeVideoId && <PlayerModalWrapper profileId={profileId} forBrand={forBrand} />}
    </>
  )
}

type LoopsPropsType = {
  initialLoops: LoopType[]
  communityId: string
  totalLoops: number
} & BasePropsType

function Loops({ communityId, initialLoops, profileId, totalLoops, forBrand }: LoopsPropsType) {
  const { isMobile } = useGenuinOptions()
  const { data: loopsData, ...queryResult } = useInfiniteQuery({
    queryKey: getQueryKeyForProfileLoops(communityId, forBrand),
    queryFn: async ({ pageParam = { lastLoopId: initialLoops[initialLoops.length - 1]?.id, pageSession: '' } }) =>
      await fetchProfileLoops({
        profileId,
        communityId,
        pageParam,
        videosLimit: getVideoLimit(!!pageParam.lastLoopId, isMobile),
        forBrand,
      }),
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
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null
      return lastPage.nextPageParam
    },
    enabled: false,
  })

  const loops = useMemo(() => loopsData?.pages.flatMap((page) => page.loops), [loopsData])

  return (
    <LoopNode availableLoopCount={loops?.length ?? 0} totalLoopCount={totalLoops} queryResult={queryResult}>
      {loops?.map((loop) => (
        <LoopItem loopDetails={loop} key={loop.id}>
          <Videos
            initialVideos={loop.videos}
            communityId={communityId}
            loopId={loop.id}
            totalVideos={loop.totalVideoCount}
            profileId={profileId}
            forBrand={forBrand}
          />
        </LoopItem>
      ))}
    </LoopNode>
  )
}

type VideoPropsType = {
  initialVideos: VideoType[]
  loopId: string
  communityId: string
  totalVideos: number
} & BasePropsType

function Videos({ initialVideos, loopId, communityId, totalVideos, profileId, forBrand }: VideoPropsType) {
  const { openPlayerModal } = useTreeStructure()
  const { isMobile } = useGenuinOptions()

  const { data: videosData, ...queryResult } = useInfiniteQuery({
    queryKey: getQueryKeyForProfileVideos(communityId, loopId, forBrand),
    queryFn: async ({ pageParam }) =>
      await fetchProfileVideos({
        profileId,
        loopId,
        pageParam,
        communityId,
        videosLimit: getVideoLimit(!!pageParam?.lastVideoId, isMobile),
        forBrand,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.end) return null
      return {
        lastVideoId: lastPage.videos[lastPage.videos.length - 1]?.id,
        pageSession: '',
      }
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

    enabled: false,
  })

  const videos = useMemo(() => videosData?.pages.flatMap((page) => page.videos) ?? [], [videosData])

  return (
    <VideosNode availableVideosCount={videos.length} totalVideoCount={totalVideos} queryResult={queryResult}>
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
  const queryKeyForFeed = getQueryKeyForProfileFeed(profileId, forBrand, videoId)
  const { isMobile } = useGenuinOptions()

  const {
    data: videosData,
    isFetching,
    fetchNextPage,
    isError,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeyForFeed,
    queryFn: async ({ pageParam = { lastMessageId: '' } }) => {
      if (!pageParam.lastMessageId) {
        return await fetchProfileFeed(profileId, forBrand, undefined, videoId)
      }
      return await fetchProfileFeed(profileId, forBrand, pageParam, undefined)
    },
    initialData: {
      pageParams: [{ lastMessageId: '' }],
      pages: [
        {
          videos: [],
          end: false,
        },
      ],
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.end) {
        return undefined // Return undefined to indicate no more pages
      }
      // Get the last video ID from the current page
      const lastVideo = lastPage.videos[lastPage.videos.length - 1]
      return lastVideo ? { lastMessageId: lastVideo.video.id } : undefined
    },
  })

  const videos = useMemo(() => {
    return videosData?.pages.flatMap((page) => page.videos)
  }, [videosData])

  if (isMobile)
    return (
      <PlayerModal.mobile
        fetchNextVideos={fetchNextPage}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        startIndex={0}
        isLoading={isFetching}
        open={!!videoId}
        videos={videos ?? []}
        close={() => {
          closePlayerModal?.()
        }}
        hasNextPage={hasNextPage}
      />
    )

  return (
    <PlayerModal.desktop
      fetchNextVideos={fetchNextPage}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      startIndex={0}
      isLoading={isFetching}
      open={!!videoId}
      videos={videos ?? []}
      close={() => {
        closePlayerModal?.()
      }}
      isInModal={true}
      hasNextPage={hasNextPage}
      onCommunityJoin={(communityId, role) => {
        updateCommunityUserRoleForProfileCommunities(profileId, forBrand, communityId, role as CommunityUserRole)
      }}
    />
  )
}
