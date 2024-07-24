import { type DetailedHTMLProps, type VideoHTMLAttributes, useRef } from 'react'
import OpenPlayerJS from 'openplayerjs'
import { useEffect, useMemo } from 'react'
import { useEmbedPlayerState } from './embed-player-state'
import { AnimatedMuteIcon } from '@components/common/player/control-layer/animated-mute-icon'
import { Actions } from '@components/common/player/control-layer/actions'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import Link from 'next/link'
import Analytics from '@services/analytics'
import { useParams } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { Progress } from '@/components/ui/progress'

type Props = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  videoData: VideoPlayerModalType
  isActive: boolean
  isFirstElement: boolean
}

export function EmbedPlayer({
  videoData,
  isActive,
  isFirstElement,
  loop,
  onEnded,
  onCanPlay,
  onTimeUpdate,
  ...props
}: Props) {
  const params = useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const localRef = useRef<{
    player: OpenPlayerJS | null
  }>({
    player: null,
  })
  const { activeVideoId, muted, toggleMuted, setTimeState } = useEmbedPlayerState(
    useShallow((state) => ({
      activeVideoId: state.activeVideoId,
      muted: state.muted,
      toggleMuted: state.toggleMuted,
      setTimeState: state.setTimeState,
    }))
  )
  const isActiveVideo = activeVideoId === videoData.video.id

  function triggerEvent(eventName: string) {
    void Analytics.track({
      eventName,
      properties: {
        content_id: videoData.video.id,
        content_category: 'loop',
        event_record_screen: 'embed',
        content_url: videoData.video.source,
        embed_id: params.id as string,
      },
    })
  }

  useEffect(() => {
    if (!videoRef.current) return
    const player = new OpenPlayerJS(videoRef.current, {
      controls: {
        alwaysVisible: false,
      },
      mode: 'fill',
      forceNative: true,
      showLoaderOnInit: true,
      onError: (e) => {},
      hls: {
        /**
         * "startLevel" option typically relates to the initial
         * quality or bitrate level at which a video stream should
         * begin playing when adaptive streaming is employed.
         */
        startLevel: -1,
        /**
         * This will make sure that player will play on other thread rather than main thread.
         */
        enableWorker: true,
        /**
         * eme -> Encrypted Media Extensions (EME)
         */
        // emeEnabled: true,
      },
    })
    void player.init().then((value) => {
      void player.load().then(() => {
        if (isActive || isFirstElement) {
          void player.play()
        }
        localRef.current.player = player
      })
    })
  }, [])

  useEffect(() => {
    const player = localRef.current.player
    if (!player) return
    if (videoData.video.id === activeVideoId) {
      void player.play()
    } else {
      player.pause()
    }
  }, [activeVideoId, isActive])

  return (
    <>
      <video
        style={{ backgroundImage: `url(${videoData.video.thumbnail})` }}
        className="absolute h-full w-full bg-cover bg-center bg-no-repeat object-cover"
        ref={videoRef}
        src={videoData.video.source}
        poster={videoData.video.thumbnail}
        muted={muted}
        playsInline
        onCanPlay={(ev) => {
          onCanPlay?.(ev)
        }}
        onPause={(e) => {
          triggerEvent('Video Paused')
        }}
        onEnded={(e) => {
          onEnded?.(e)
          triggerEvent('Video Watched')
          if (loop) void localRef.current.player?.play()
        }}
        onTimeUpdate={(e) => {
          const element = e.target as HTMLVideoElement
          setTimeState(element.currentTime, element.duration)
          onTimeUpdate?.(e)
        }}
        {...props}
      />
      {muted && isActiveVideo && (
        <div
          className="absolute inset-0 left-2 top-2 w-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            toggleMuted()
            void Analytics.track({
              eventName: 'Unmute',
              properties: {},
            })
          }}>
          <AnimatedMuteIcon />
        </div>
      )}
      {isActiveVideo && (
        <div className="absolute bottom-0 w-full">
          <div className="flex justify-between p-2">
            <div className="flex w-4/5 flex-col justify-end">
              <Link href={videoData.video.shareUrl} target="_blank">
                <div className="z-10 flex items-center">
                  <CustomAvatar
                    className="bg-red-40"
                    imageUrl={videoData.owner.profileImage}
                    fallbackString={videoData.owner.name ?? ''}
                    isAvatar={videoData.owner.isAvatar}
                  />
                  <p className="line-clamp-1 px-2 text-title-3-bold text-monochrome-white">
                    @{videoData.owner.userName}
                  </p>
                </div>
              </Link>
              {videoData.video.descriptionText && (
                <span className="line-clamp-2 w-full break-all text-body-1-demi text-monochrome-white">
                  {videoData.video.descriptionText}
                </span>
              )}
            </div>
            <div className="z-10">
              <Actions.desktop
                shareUrl={videoData.video.shareUrl}
                sparkCount={videoData.video.sparkCount}
                videoId={videoData.video.id}
                attachedLink={videoData.video.attachedLink}
                description={videoData.video.descriptionText}
                videoSlug={videoData.video.slug}
                isSparked={false}
              />
            </div>
          </div>
          <PlayerProgressBar />
        </div>
      )}
    </>
  )
}

function PlayerProgressBar() {
  const { currentTime, duration } = useEmbedPlayerState(
    useShallow((state) => ({ timeState: state.timeState }))
  ).timeState

  const progressValue = useMemo(() => {
    if (duration === 0) return 0
    return Math.round((currentTime / duration) * 100)
  }, [currentTime, duration])

  return <Progress value={progressValue} className="absolute bottom-0 left-0 h-[2px] transition-all duration-300" />
}
