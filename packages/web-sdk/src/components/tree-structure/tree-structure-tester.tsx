// import {
//   TreeStructure,
//   CommunitiesNode,
//   CommunityItem,
//   LoopNode,
//   LoopItem,
//   VideoItem,
//   VideosNode,
//   CommunityUserRole,
//   type FetchCommunityReturnType,
//   type LoopType,
//   type VideoType,
// } from '@/components/tree-structure'
// import {
//   fetchBrandFeed,
//   fetchCommunities,
//   fetchLoops,
//   fetchProfileVideos,
// } from './profile'
// import {
//   type InfiniteData,
//   useInfiniteQuery,
//   useQueryClient,
// } from '@tanstack/react-query'
// import { useCallback, useEffect, useMemo, useState } from 'react'
// import { Dialog, DialogContent } from '@/components/ui/dialog'
// import { useSizeContext } from '@/context/size'
// import { FullScreenMobileView } from '@/components/full-screen-view/mobile'
// import { FullScreenDesktopView } from '@/components/full-screen-view/desktop'
// import { Loader } from '@/components/loader'
// import { cn } from '@/utils'
// import { useTreeStructure } from '@/components/tree-structure/context'
// import { getQueryKeyForProfileCommunities } from '@/utils/constants/keys'

// const brandId: string = '2023'
// export function TreeStructureTester() {
//   return <TreeStructure className='p-8'>{/* <Ui /> */}</TreeStructure>
// }

// // function Ui() {
// //   const { activeVideoId } = useTreeStructure()
// //   const queryClient = useQueryClient()
// //   const { data: communitiesData, ...queryResult } = useInfiniteQuery({
// //     queryFn: async ({ pageParam }) => fetchCommunities({ brandId, pageParam }),
// //     queryKey: getQueryKeyForCommunities(brandId),
// //     initialPageParam: { lastCommunityId: '', pageSession: '' },
// //     getNextPageParam: (lastPage) => {
// //       if (lastPage.end) return null
// //       return lastPage.nextPageParam
// //     },
// //   })
// //   const communities = useMemo(
// //     () => communitiesData?.pages.flatMap((page) => page.communities),
// //     [communitiesData],
// //   )

// //   const updateCommunityUserRole = useCallback(
// //     (communityId: string, newRole: CommunityUserRole) => {
// //       queryClient.setQueryData<InfiniteData<FetchCommunityReturnType>>(
// //         getQueryKeyForProfileCommunities(brandId),
// //         (oldData): InfiniteData<FetchCommunityReturnType> | undefined => {
// //           if (!oldData) return oldData
// //           return {
// //             ...oldData,
// //             pages: oldData.pages.map((page) => {
// //               return {
// //                 ...page,
// //                 communities: page.communities.map((community) => {
// //                   if (community.id === communityId) {
// //                     return {
// //                       ...community,
// //                       role: newRole,
// //                     }
// //                   }
// //                   return community
// //                 }),
// //               }
// //             }),
// //           }
// //         },
// //       )
// //     },
// //     [],
// //   )
// //   return (
// //     <>
// //       <CommunitiesNode
// //         communities={communities}
// //         queryResult={queryResult}>
// //         {communities?.map((community) => (
// //           <CommunityItem
// //             communityDetails={community}
// //             key={community.id}
// //             onCommunityRoleChanged={(newRole) => {
// //               updateCommunityUserRole(community.id, newRole)
// //             }}
// //             className='my-4'>
// //             <Loops
// //               communityId={community.id}
// //               initialLoops={community.loops}
// //               totalLoops={community.totalLoops}
// //             />
// //           </CommunityItem>
// //         ))}
// //       </CommunitiesNode>
// //       {activeVideoId && <PlayerModalWrapper />}
// //     </>
// //   )
// // }

// type LoopsPropsType = {
//   initialLoops: Array<LoopType>
//   communityId: string
//   totalLoops: number
// }

// function Loops({ communityId, initialLoops, totalLoops }: LoopsPropsType) {
//   const { data: loopsData, ...queryResult } = useInfiniteQuery({
//     queryFn: ({ pageParam }) =>
//       fetchLoops({ brandId, communityId, pageParams: pageParam }),
//     initialPageParam: {
//       lastLoopId: initialLoops[initialLoops.length - 1]?.id,
//       pageSession: '',
//     },
//     initialData: {
//       pageParams: [{ lastLoopId: '', pageSession: '' }],
//       pages: [
//         {
//           loops: initialLoops,
//           nextPageParam: {
//             lastLoopId: initialLoops[initialLoops.length - 1]?.id,
//             pageSession: '',
//           },
//           end: false,
//         },
//       ],
//     },
//     queryKey: getQueryKeyForLoops(communityId),
//     getNextPageParam: (lastPage) => {
//       if (lastPage.end) return null
//       return lastPage.nextPageParam
//     },
//     enabled: false,
//   })

//   const loops = useMemo(
//     () => loopsData?.pages.flatMap((page) => page.loops),
//     [loopsData],
//   )

//   return (
//     <LoopNode
//       availableLoopCount={loops.length}
//       totalLoopCount={totalLoops}
//       queryResult={queryResult}>
//       {loops?.map((loop) => {
//         return (
//           <LoopItem
//             loopDetails={loop}
//             key={loop.id}>
//             <Videos
//               initialVideos={loop.videos}
//               communityId={communityId}
//               loopId={loop.id}
//               totalVideos={loop.totalVideoCount}
//             />
//           </LoopItem>
//         )
//       })}
//     </LoopNode>
//   )
// }

// type VideoPropsType = {
//   initialVideos: VideoType[]
//   loopId: string
//   communityId: string
//   totalVideos: number
// }

// function Videos({
//   initialVideos,
//   loopId,
//   communityId,
//   totalVideos,
// }: VideoPropsType) {
//   const { openPlayerModal } = useTreeStructure()
//   const { data: videosData, ...queryResult } = useInfiniteQuery({
//     queryKey: getQueryKeyForVideos(communityId, loopId),
//     queryFn: ({ pageParam }) =>
//       fetchProfileVideos({ brandId, loopId, pageParam, communityId }),
//     initialPageParam: {
//       lastVideoId: initialVideos[initialVideos.length - 1].id,
//       pageSession: '',
//     },
//     initialData: {
//       pageParams: [
//         {
//           lastVideoId: initialVideos[initialVideos.length - 1].id,
//           pageSession: '',
//         },
//       ],
//       pages: [
//         {
//           videos: initialVideos,
//           end: false,
//           nextPageParam: {
//             lastVideoId: initialVideos[initialVideos.length - 1].id,
//             pageSession: '',
//           },
//         },
//       ],
//     },
//     getNextPageParam: (lastPage) => {
//       if (lastPage.end) return null
//       return lastPage.nextPageParam
//     },
//     enabled: false,
//   })

//   const videos = useMemo(
//     () => videosData.pages.flatMap((page) => page.videos),
//     [videosData],
//   )

//   return (
//     <VideosNode
//       availableVideosCount={videos.length}
//       totalVideoCount={totalVideos}
//       queryResult={queryResult}>
//       {videos?.map((video) => {
//         return (
//           <VideoItem
//             key={video.id}
//             videoDetails={video}
//             onClick={() => {
//               openPlayerModal?.(video.id)
//             }}
//           />
//         )
//       })}
//     </VideosNode>
//   )
// }

// // TODO: this implementation is only for web-sdk. I haven't thought about web-application yet.
// // Will be moving this component to tree structure soon.
// function PlayerModalWrapper() {
//   const { activeVideoId: videoId, closePlayerModal } = useTreeStructure()
//   const {
//     data: videosData,
//     isLoading,
//     fetchNextPage,
//   } = useInfiniteQuery({
//     queryKey: ['brandFeed', brandId, videoId],
//     queryFn: ({ pageParam }) => {
//       // Only use fromVideoId for the first page when pageParam is undefined
//       if (!pageParam) {
//         return fetchBrandFeed(brandId, undefined, videoId)
//       }
//       // For subsequent pages, use lastMessageId from pageParam
//       return fetchBrandFeed(brandId, pageParam, undefined)
//     },
//     initialPageParam: { lastMessageId: '' },
//     getNextPageParam: (lastPage) => {
//       if (lastPage.end) {
//         return undefined // Return undefined to indicate no more pages
//       }
//       // Get the last video ID from the current page
//       const lastVideo = lastPage.feed[lastPage.feed.length - 1]
//       return lastVideo ? { lastMessageId: lastVideo.uuid } : undefined
//     },
//   })

//   const videos = useMemo(
//     () => videosData?.pages.flatMap((page) => page.feed),
//     [videosData],
//   )

//   const [activeIndex, setActiveIndex] = useState(0)
//   const { isMobile, sizeBoxes } = useSizeContext()

//   useEffect(() => {
//     if (!videos) return
//     if (activeIndex === videos.length - 4) {
//       fetchNextPage()
//     }
//   }, [activeIndex, videos])

//   return (
//     <Dialog open={!!videoId}>
//       <DialogContent
//         className={cn('bg-transparent p-0')}
//         showClose={false}>
//         {isLoading || !videos ? (
//           <Loader />
//         ) : !videos ? (
//           <div>No content.</div>
//         ) : isMobile ? (
//           <FullScreenMobileView
//             activeIndex={activeIndex}
//             closeModal={() => {
//               console.log('close modal.')
//               closePlayerModal?.()
//             }}
//             shouldPlay
//             showNavigationBar
//             sizeBox={sizeBoxes.modal ?? { width: 0, height: 0 }}
//             updateActiveIndex={(newIndex) => {
//               setActiveIndex(newIndex)
//             }}
//             videos={videos}
//             forStandardWall={false}
//             showClose
//           />
//         ) : (
//           <FullScreenDesktopView
//             disableNextButton={activeIndex === videos.length - 1}
//             disablePreviousButton={activeIndex === 0}
//             modalSizeBox={sizeBoxes.modal}
//             onClickOnNext={() => {
//               setActiveIndex((old) => old + 1)
//             }}
//             onClickOnPrevious={() => {
//               setActiveIndex((old) => old - 1)
//             }}
//             shouldPlay
//             videoDetails={videos[activeIndex]}
//             videoSizeBox={sizeBoxes.video}
//             closeModal={() => {
//               closePlayerModal?.()
//             }}
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   )
// }
