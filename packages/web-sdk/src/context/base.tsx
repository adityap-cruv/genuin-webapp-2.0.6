import { Analytics } from '@/analytics'
import { notificationsCount } from '@/components/pages/notification/notification'
import { useGetFeed } from '@/hooks/useGetFeed'
import {
  BrandDetailsConfigType,
  CommunityJoinStatusType,
  CustomizationType,
  EmbedDataType,
  FeedType,
  type FeedVideoType,
} from '@/type'
import { reverseRoleMapping } from '@/utils'
import React, { useCallback, useEffect, useState, useRef } from 'react'

export type ShouldPlayType =
  | 'COMMENT'
  | 'FULLSCREEN'
  | 'FLOAT'
  | 'EMBED'
  | 'STANDARD_WALL'
  | 'NONE'

export type ActionButtonType = 'mute' | 'unmute' | 'play' | 'pause' | ''
export type PlayingStateType = 'paused' | 'playing' | 'loading' | ''

type BaseContextType = {
  videos: FeedVideoType[]
  setVideos: React.Dispatch<React.SetStateAction<FeedVideoType[]>>
  hasNextPage: boolean
  activeIndex: number
  updateActiveIndex: React.Dispatch<React.SetStateAction<number>>
  muted: boolean
  updateMuted: (value: boolean) => void
  shouldPlay: ShouldPlayType
  updateShouldPlay: React.Dispatch<React.SetStateAction<ShouldPlayType>>
  customizations: CustomizationType | null
  brandDetails?: BrandDetailsConfigType
  rootFocusStatus: {
    isInView: boolean
    isFocused: boolean
  }
  toggleSpark: (videoId: string) => void
  updateCommunityJoinState: (
    communityId: string,
    joinStatus: CommunityJoinStatusType,
  ) => void
  increaseCommentCount: (videoId: string, value: number) => void
  baseSwiperRef: React.MutableRefObject<{
    swiper: any
    ratio: number | null
  }>
  activeFeed: FeedType
  updateActiveFeed: React.Dispatch<React.SetStateAction<FeedType>>
  isLoading: boolean
  volume: number
  setVolume: (volume: number) => void
  buttonAction: ActionButtonType
  handlePlayerAction: (action: ActionButtonType) => void

  setNotificationCount: React.Dispatch<React.SetStateAction<number>>
  notificationCount: number

  playingState?: PlayingStateType
  setPlayingState: (state: PlayingStateType) => void

  isVideoPlaying: boolean
  setIsVideoPlaying: (value: boolean) => void
}

/**
 * This context is used to render feed and used as base block of web-sdk. It provides the following values:
 * - videos: List of videos to be rendered
 * - setVideos: Function to update the list of videos
 * - hasNextPage: Boolean to check if there are more videos to fetch
 * - activeIndex: Index of the video that is currently being viewed
 * - updateActiveIndex: Function to update the active index
 * - muted: Boolean to check if the video is muted
 * - updateMuted: Function to update the muted state
 * - shouldPlay: Enum to check if the video should play
 */
export const BaseContext = React.createContext<BaseContextType>({
  videos: [],
  setVideos: () => {},
  hasNextPage: true,
  activeIndex: 0,
  muted: true,
  shouldPlay: 'EMBED',
  customizations: null,
  updateActiveIndex: () => {},
  updateMuted: () => {},
  updateShouldPlay: () => {},
  rootFocusStatus: {
    isInView: false,
    isFocused: false,
  },
  toggleSpark: () => {},
  updateCommunityJoinState: () => {},
  increaseCommentCount: () => {},
  baseSwiperRef: { current: { ratio: 1, swiper: null } },
  activeFeed: 'HOME',
  updateActiveFeed: () => {},
  isLoading: true,
  volume: 0,
  setVolume: () => {},
  buttonAction: '',
  handlePlayerAction: () => {},

  setNotificationCount: () => {},
  notificationCount: -1,

  playingState: '',
  setPlayingState: () => {},

  isVideoPlaying: true,
  setIsVideoPlaying: () => {},
})

type BaseContextProviderPropsType = {
  children: React.ReactNode
  embedData: EmbedDataType
}

// TODO: Separate out the logic for base provider to a separate file. ans use react-query for fetching data of feeds.
export function BaseContextProvider({
  children,
  embedData,
}: BaseContextProviderPropsType) {
  // This state is used to keep track of the active feed type.
  const [activeFeed, setActiveFeed] = useState<FeedType>('HOME')
  // This call is made to fetch the videos
  const {
    isLoading,
    fetchNextVideosPage,
    videos: videosFromApi,
    hasNextPage,
    isLoadingNextPage,
  } = useGetFeed({
    communityIds: embedData.customization?.community_ids,
    loopIds: embedData.customization?.community_loop_ids,
    feedType: activeFeed,
  })

  const [videos, setVideos] = useState<FeedVideoType[]>([])
  const [activeIndex, setActiveIndex] = React.useState(
    // If embed style is standard wall then set active index to 0
    embedData.style === 'standard_wall'
      ? 0
      : // If autoplay is enabled then set active index to 0 else -1, to play or pause the video.
        embedData.customization?.autoplay
        ? 0
        : -1,
  )
  const [muted, setMuted] = React.useState(true)
  const [shouldPlay, setShouldPlay] = React.useState<ShouldPlayType>(
    embedData.style === 'standard_wall' ? 'STANDARD_WALL' : 'EMBED',
  )
  const [volume, setVolume] = React.useState(0) // Add volume state
  const [prevVolume, setPrevVolume] = useState(100) // Store the last non-zero volume
  const [buttonAction, setButtonAction] = useState<ActionButtonType>('')
  const [playingState, setPlayingState] = useState<PlayingStateType>('')
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(true)
  const [isFocused, setIsFocused] = React.useState(true)
  const [isIntersecting, setIsIntersecting] = React.useState(true)
  const baseSwiperRef = useRef<{
    swiper: any
    ratio: number | null
  }>({
    swiper: null,
    ratio: null,
  })

  const [notificationCount, setNotificationCount] = React.useState(-1)

  useEffect(() => {
    async function fetchNotificationCount() {
      const response = await notificationsCount()
      if (!response) return
      if (response.status) setNotificationCount(response.count)
    }

    fetchNotificationCount()
  }, [])

  useEffect(() => {
    if (videosFromApi.length === 0 || isLoadingNextPage) return
    if (
      activeIndex + 2 >
        videosFromApi.length - Math.ceil(baseSwiperRef.current.ratio ?? 3) &&
      hasNextPage
    ) {
      fetchNextVideosPage()
    }
  }, [
    activeIndex,
    fetchNextVideosPage,
    videosFromApi,
    isLoadingNextPage,
    hasNextPage,
  ])

  useEffect(() => {
    return () => {
      setActiveIndex(0)
    }
  }, [isLoading])

  useEffect(() => {
    return () => {
      setVideos([])
    }
  }, [activeFeed])

  useEffect(() => {
    if (videosFromApi.length === 0) return
    setVideos((oldVideos) => {
      // Check and remove last 10 nulls only if they exist
      const hasTrailingNulls =
        oldVideos.length >= 10 &&
        oldVideos.slice(-10).every((item) => item === null)
      const cleanedVideos = hasTrailingNulls
        ? oldVideos.slice(0, -10)
        : oldVideos

      // Append new videos from API
      const updatedVideos = [
        ...cleanedVideos,
        ...videosFromApi.slice(cleanedVideos.length),
      ]

      // Add placeholders if needed
      return hasNextPage
        ? [...updatedVideos, ...Array(10).fill(null)]
        : updatedVideos
    })
  }, [videosFromApi, hasNextPage])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true)
          } else {
            setIsIntersecting(false)
          }
        })
      },
      { threshold: 0.3 },
    )
    if (embedData.customization?.element)
      observer.observe(embedData.customization.element)

    function handleFocusHandler() {
      setIsFocused(true)
    }
    function handleBlurHandler() {
      setIsFocused(false)
    }

    window.addEventListener('focus', handleFocusHandler)
    window.addEventListener('blur', handleBlurHandler)
    return () => {
      window.removeEventListener('focus', handleFocusHandler)
      window.removeEventListener('blur', handleBlurHandler)
      observer.disconnect()
    }
  }, [])

  const toggleSpark = useCallback((videoId: string) => {
    setVideos((oldVideos) => {
      const indexToChange = oldVideos.findIndex(
        (video) => video && video.video.uuid === videoId,
      )
      oldVideos[indexToChange].video.is_sparked =
        !oldVideos[indexToChange].video.is_sparked
      if (oldVideos[indexToChange].video.is_sparked) {
        oldVideos[indexToChange].video.no_of_sparks += 1
      } else {
        oldVideos[indexToChange].video.no_of_sparks -= 1
      }
      return [...oldVideos]
    })
  }, [])

  const updateCommunityJoinState = useCallback(
    (communityId: string, joinStatus: CommunityJoinStatusType) => {
      setVideos((oldVideos) => {
        oldVideos.forEach((video) => {
          if (video && video.community.uuid === communityId) {
            if (joinStatus === 'requested') {
              video.community.is_join_requested = true
              video.community.logged_in_user_role = undefined
            } else if (joinStatus === 'unjoined') {
              video.community.is_join_requested = false
              video.community.logged_in_user_role = undefined
            } else {
              video.community.logged_in_user_role =
                reverseRoleMapping[joinStatus]
            }
          }
        })
        return [...oldVideos]
      })
    },
    [],
  )

  const increaseCommentCount = useCallback(
    (videoId: string, value: number = 1) => {
      setVideos((oldVideos) => {
        const indexToChange = oldVideos.findIndex(
          (video) => video && video.video.uuid === videoId,
        )
        oldVideos[indexToChange].video.no_of_comments += value
        return [...oldVideos]
      })
    },
    [],
  )

  return (
    <BaseContext.Provider
      value={{
        activeIndex,
        updateActiveIndex: setActiveIndex,
        hasNextPage,
        muted,
        updateMuted: (value) => {
          setMuted(value)
          Analytics.track(
            value
              ? Analytics.EventNames.VideoMuted
              : Analytics.EventNames.VideoUnmuted,
            { video_id: videos[activeIndex]?.video.uuid },
          )
          if (value) {
            setPrevVolume(volume > 0 ? volume : 100) // Store last volume before muting
            setVolume(0) // Mute
          } else {
            setVolume(prevVolume) // Restore previous volume when unmuted
          }
        },
        shouldPlay,
        updateShouldPlay: (shouldPlay) => {
          setShouldPlay(shouldPlay)
        },
        customizations: embedData.customization as any,
        videos,
        setVideos,
        rootFocusStatus: { isFocused, isInView: isIntersecting },
        toggleSpark,
        updateCommunityJoinState,
        increaseCommentCount,
        baseSwiperRef,
        brandDetails: embedData.brandDetails,
        activeFeed,
        updateActiveFeed: setActiveFeed,
        isLoading,
        volume,
        setVolume: (newVolume) => {
          setVolume(newVolume)
          if (newVolume > 0) {
            setMuted(false)
            setPrevVolume(newVolume)
          } else {
            setMuted(true)
          }
        },
        buttonAction,
        handlePlayerAction: (action: ActionButtonType) => {
          if (!action) {
            setButtonAction('')
            return
          }
          setButtonAction(action) // Set the button action (play, pause, etc.)
        },

        setNotificationCount,
        notificationCount,
        setPlayingState,
        playingState,
        isVideoPlaying,
        setIsVideoPlaying,
      }}>
      {children}
    </BaseContext.Provider>
  )
}

export const useBaseContext = () => {
  const context = React.useContext(BaseContext)
  if (!context) {
    throw new Error('Please use this component inside base context component.')
  }
  return context
}
