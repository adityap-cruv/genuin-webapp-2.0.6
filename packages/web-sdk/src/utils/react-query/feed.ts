/**
 * This file only contains the functions that are used to update the feed data.
 */

import {
  CommunityUserRole,
  reverseMapCommunityUserRole,
} from '@/components/tree-structure'
import { FetchFeedReturnType } from '@/type'
import { queryClient } from '@/context/react-query'
import { type InfiniteData, type QueryKey } from '@tanstack/react-query'

type QueryDataType = InfiniteData<FetchFeedReturnType>

/**
 * This function is used to update the community join status. It will update the community role and join status.
 * It will only update Data which is related to queryKey
 * @param queryKey
 * @param communityId
 * @param newRole
 */
export const updateCommunityJoinStatus = (
  queryKey: QueryKey,
  communityId: string,
  newRole: CommunityUserRole,
) => {
  queryClient.setQueryData<QueryDataType>(
    queryKey,
    (oldData): QueryDataType | undefined => {
      if (!oldData) return oldData
      return {
        ...oldData,
        pages: oldData.pages.map((page) => {
          return {
            ...page,
            videos: page.videos.map((video) => {
              const { isRequested, role } = reverseMapCommunityUserRole(newRole)
              if (communityId === video.community.uuid) {
                return {
                  ...video,
                  community: {
                    ...video.community,
                    logged_in_user_role: role,
                    is_join_requested: isRequested,
                  },
                }
              }
              return video
            }),
          }
        }),
      }
    },
  )
}

/**
 * This function is used to update the spark status. It will update the spark status and spark count.
 * It will only update Data which is related to passed queryKey
 * @param queryKey
 * @param videoId
 * @param isSparked
 */
export const updateSparkStatus = (
  queryKey: QueryKey,
  videoId: string,
  isSparked: boolean,
) => {
  queryClient.setQueryData<QueryDataType>(
    queryKey,
    (oldData): QueryDataType | undefined => {
      if (!oldData) return oldData
      return {
        ...oldData,
        pages: oldData.pages.map((page) => {
          return {
            ...page,
            videos: page.videos.map((video) => {
              if (video.uuid === videoId) {
                return {
                  ...video,
                  video: {
                    ...video.video,
                    is_sparked: isSparked,
                    no_of_sparks: isSparked
                      ? video.video.no_of_sparks + 1
                      : video.video.no_of_sparks - 1,
                  },
                }
              }
              return video
            }),
          }
        }),
      }
    },
  )
}

/**
 * This function is used to update the comment count. It will update the comment count.
 * It will only update Data which is related to passed queryKey
 * @param queryKey
 * @param videoId
 * @param count
 */
export const updateCommentCount = (
  queryKey: QueryKey,
  videoId: string,
  count: number,
) => {
  queryClient.setQueryData<QueryDataType>(
    queryKey,
    (oldData): QueryDataType | undefined => {
      if (!oldData) return oldData
      return {
        ...oldData,
        pages: oldData.pages.map((page) => {
          return {
            ...page,
            videos: page.videos.map((video) => {
              if (video.uuid === videoId) {
                return {
                  ...video,
                  video: {
                    ...video.video,
                    no_of_comments: count,
                  },
                }
              }
              return video
            }),
          }
        }),
      }
    },
  )
}
