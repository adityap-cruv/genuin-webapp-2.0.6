'use client'
import { useEffect, type VideoHTMLAttributes, type DetailedHTMLProps, useState } from 'react'
import { usePlayerControlStore } from './player-control-store'
import { useGenuinOptions, type VideoSizeBoxType } from '@lib/stores/genuin-options'
import { ControlLayer } from './control-layer'
import { type VideoPlayerModalType } from '@lib/schemas/player/video'
import { useShallow } from 'zustand/react/shallow'
import { InnerPlayer } from './inner-player'
import { CommentSheet } from './comment-sheet'
import { getWebpUrlForImage } from '@/lib/utils'

type MobileProps = {
  videoDetails: VideoPlayerModalType
  /**
   * Swiper's active param.
   */
  isActive: boolean
  /**
   * Controls whether video should repeat or not.
   * default: false
   */
  loop?: boolean
  /**
   * default: true
   */
  // showControls?: boolean
  /**
   * Pass this parameter if you want to configure custom size box.
   */
  customSizeBox?: VideoSizeBoxType
} & DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>

export function Mobile({
  videoDetails,
  isActive,
  loop = false,
  customSizeBox,
  ...restProps
}: Omit<MobileProps, 'sizeBox'>) {
  const sizeBox =
    customSizeBox ?? useGenuinOptions(useShallow((state) => ({ sizeBoxes: state.sizeBoxes }))).sizeBoxes.default
  const hasFocus = useGenuinOptions(useShallow((state) => ({ userHasFocus: state.userHasFocus }))).userHasFocus
  const { setShouldPlay, toggleShouldPlay } = usePlayerControlStore(
    useShallow((state) => ({
      setShouldPlay: state.setShouldPlay,
      toggleShouldPlay: state.toggleShouldPlay,
    }))
  )
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    hasFocus ? setShouldPlay(true) : setShouldPlay(false)
  }, [hasFocus])

  return (
    <div
      onClick={(e) => {
        toggleShouldPlay()
      }}
      style={{ backgroundImage: `url(${videoDetails.video.thumbnail})` }}
      className="relative flex h-full w-full snap-start items-center justify-center overflow-clip bg-cover bg-center bg-no-repeat">
      <div className="absolute top-0 z-10 h-24 w-full bg-gradient-to-b from-[#111111b3] to-[#11111100]" />
      <div className="absolute bottom-0 z-10 h-24 w-full bg-gradient-to-b from-[#11111100] to-[#111111b3]" />
      {isExpanded && (
        <div
          className="absolute bottom-0 z-10 h-full w-full bg-gradient-to-b from-[#11111100] to-[#111111] transition-all"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
        />
      )}
      <div className="relative overflow-hidden" style={{ width: sizeBox.width, height: sizeBox.height }}>
        <InnerPlayer
          isActive={isActive}
          id={videoDetails.video.id}
          loop={loop}
          videoSource={videoDetails.video.source}
          poster={getWebpUrlForImage(videoDetails.video.thumbnail)}
          {...restProps}
        />
        <div className="absolute left-0 top-0 h-full w-full">
          <ControlLayer.mobile
            communityImage={videoDetails.community.profileImage ?? ''}
            communityName={videoDetails.community.name ?? ''}
            communitySlug={videoDetails.community.slug}
            loopName={videoDetails.loop.name ?? ''}
            loopSlug={videoDetails.loop.slug}
            isActive={isActive}
            linkoutId={videoDetails.video.linkoutId}
            commentCount={videoDetails.video.commentCount}
            owner={{
              ...videoDetails.owner,
              brand: videoDetails.owner.brand
                ? {
                    ...videoDetails.owner.brand,
                    brand_user_logo: videoDetails.owner.brand.brand_user_logo ?? 1,
                  }
                : null,
            }}
            shareUrl={videoDetails.video.shareUrl}
            slug={videoDetails.video.slug}
            sparkCount={videoDetails.video.sparkCount}
            videoId={videoDetails.video.id}
            attachedLink={videoDetails.video.attachedLink}
            descriptionArr={videoDetails.video.descriptionArr}
            descriptionText={videoDetails.video.descriptionText}
            isSparked={videoDetails.video.isSparked}
            clickableUrl={videoDetails.video.clickableUrl}
            linkouts={videoDetails.video.linkouts}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </div>
        <CommentSheet videoDetails={videoDetails} />
      </div>
    </div>
  )
}
