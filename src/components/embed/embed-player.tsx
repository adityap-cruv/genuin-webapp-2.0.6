import { type DetailedHTMLProps, type VideoHTMLAttributes, useRef } from 'react'
import OpenPlayerJS from 'openplayerjs'
import { useEffect } from 'react'
import { useEmbedPlayerState } from './embed-player-state'
import { AnimatedMuteIcon } from '@components/common/player/control-layer/animated-mute-icon'
import { Actions } from '@components/common/player/control-layer/actions'
import { CustomAvatar } from '@components/custom/custom-avatar'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import Link from 'next/link'
import Analytics from '@services/analytics'
import { useParams } from 'next/navigation'

type Props = DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement> & {
  videoData: VideoPlayerModalType
  /**
   * Pass if player is first element of list to get it playing.
   */
  isFirstElement: boolean
  isActive: boolean
}

export function EmbedPlayer({ videoData, isFirstElement, isActive, onCanPlay, ...props }: Props) {
  const params = useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const localRef = useRef<{
    player: OpenPlayerJS | null
  }>({
    player: null,
  })
  const { activeVideoId, muted, toggleMuted } = useEmbedPlayerState()
  // const onTimeUpdateEventHandler: ReactEventHandler<HTMLVideoElement> = (event) => {
  //   setTimeState(event.currentTarget.currentTime, event.currentTarget.duration)
  // }

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
        if (isFirstElement) {
          player
            .getMedia()
            .play()
            .then((_) => {
              // console.log('start playing')
            })
            .catch((e) => {
              // console.log('something went wrong..', e)
            })
        }
        // console.log('loadded::', activeVideoId === videoId)

        localRef.current.player = player
      })
    })
  }, [])

  useEffect(() => {
    const player = localRef.current.player
    if (!player) return
    // const startTime = performance.now()
    if (videoData.video.id === activeVideoId) {
      player
        .play()
        .then(() => {
          // const endTime = performance.now()
          // const loadingTimeMillis = endTime - startTime
          // setLatency(Math.floor(loadingTimeMillis))
          // console.log('starts playing from use effect.')
        })
        .catch((e) => {
          // console.error('error from use effect', e)
        })
    } else {
      player.pause()
    }
  }, [activeVideoId])

  return (
    <>
      <video
        className="absolute h-full w-full object-cover"
        ref={videoRef}
        src={videoData.video.source}
        poster={videoData.video.thumbnail}
        muted={muted}
        playsInline
        onCanPlay={(ev) => {
          onCanPlay?.(ev)
        }}
        onEnded={(e) => {
          void Analytics.track({
            eventName: 'Video Watched',
            properties: {
              content_id: videoData.video.id,
              content_category: 'loop',
              event_record_screen: 'embed',
              content_url: videoData.video.source,
              embed_id: params.id as string,
            },
          })
        }}
        {...props}
      />
      {muted && isActive && (
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
      {isActive && (
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
                isSparked={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
