import { cn, getIconLink, isCheckFifthVideoType } from '@/utils'
import { useBaseContext } from '@/context/base'
import { EmbedPlayer } from '@/components/player/embed'
import { EmbedHeader } from '@/components/embed-header'
import { useSwiper } from '@/hooks/useSwiper'
import { memo } from 'react'
import { Shimmer } from '@/components/shimmer'
import { useSizeContext } from '@/context/size'
import { CarasouelShimmers } from '@/components/shimmers/Carasouel'

const CAROUSEL_LIST_ID = '__gen__sdk__carousel__list__class'

export const Carousel = memo(({ elementId }: { elementId: string }) => {
  const { customizations, videos, hasNextPage, isLoading, brandDetails } =
    useBaseContext()
  const {
    handleOnEnded,
    handleSwipeNext,
    handleSwipePrev,
    handleOnHoverOfPlayer,
    swiperStatus,
  } = useSwiper(`#${CAROUSEL_LIST_ID}${elementId}`, false)
  const {
    sizeBoxes: { video: videoBoxSize },
  } = useSizeContext()

  return (
    <>
      {isLoading ? (
        <CarasouelShimmers.Carousel
          embedWidth={customizations?.dimensions.width || 0}
          customizations={customizations!}
          videoHeight={videoBoxSize.height}
          videoWidth={videoBoxSize.width}
        />
      ) : (
        <div className='flex flex-col h-full w-full'>
          <EmbedHeader
            className={cn(
              isCheckFifthVideoType(brandDetails?.brand_id) &&
                customizations?.view === 'carousel'
                ? '!p-0 !pb-3'
                : 'p-2',
            )}
            forFeed={false}
          />
          <div
            id={CAROUSEL_LIST_ID + elementId}
            className='swiper h-full w-full flex-grow flex'>
            <div className='swiper-wrapper'>
              {videos.map((video, index) => {
                return (
                  <div
                    key={index}
                    className={cn('swiper-slide flex flex-col', {
                      '!mr-3': isCheckFifthVideoType(brandDetails?.brand_id),
                    })}>
                    {!video ? (
                      <Shimmer
                        key={index}
                        className='rounded-lg'
                      />
                    ) : (
                      <EmbedPlayer
                        onHover={handleOnHoverOfPlayer}
                        index={index}
                        videoData={video}
                        id={getCarouselPlayerId(video.uuid)}
                        onEnded={
                          customizations?.is_loop_video
                            ? undefined
                            : (e) => {
                                handleOnEnded(e, index)
                              }
                        }
                      />
                    )}
                  </div>
                )
              })}
            </div>
            {(hasNextPage || !swiperStatus.atEnd) &&
              !(
                isCheckFifthVideoType(brandDetails?.brand_id) &&
                customizations?.view === 'carousel'
              ) && (
                <div
                  className='__gen__sdk__right__side__icons  __gen__sdk__flex__center'
                  onClick={handleSwipeNext}>
                  <img
                    alt='right-arrow'
                    src={getIconLink('rightArrowIcon')}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
              )}
            {!swiperStatus.atBeginning &&
              !(
                isCheckFifthVideoType(brandDetails?.brand_id) &&
                customizations?.view === 'carousel'
              ) && (
                <div
                  className='__gen__sdk__left__side__icons __gen__sdk__flex__center'
                  onClick={handleSwipePrev}>
                  <img
                    alt='left-arrow'
                    src={getIconLink('leftArrowIcon')}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
              )}
          </div>
        </div>
      )}
    </>
  )
})

function getCarouselPlayerId(id: string) {
  return '__carousel__player__' + id
}
