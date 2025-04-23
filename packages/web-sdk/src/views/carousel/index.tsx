import { getIconLink } from '@/utils'
import { useBaseContext } from '@/context/base'
import { EmbedPlayer } from '@/components/player/embed'
import { EmbedHeader } from '@/components/embed-header'
import { useSwiper } from '@/hooks/useSwiper'
import { memo } from 'react'
import { Shimmer } from '@/components/shimmer'

const CAROUSEL_LIST_ID = '__gen__sdk__carousel__list__class'

export const Carousel = memo(() => {
  const { customizations, videos, hasNextPage } = useBaseContext()
  const {
    handleOnEnded,
    handleSwipeNext,
    handleSwipePrev,
    handleOnHoverOfPlayer,
    swiperStatus,
  } = useSwiper(`#${CAROUSEL_LIST_ID}`, false)

  return (
    <>
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <EmbedHeader
          style={{ padding: 8 }}
          forFeed={false}
        />
        <div
          id={CAROUSEL_LIST_ID}
          className='swiper'
          style={{
            height: '100%',
            width: '100%',
            flexGrow: 1,
            display: 'flex',
          }}>
          <div className='swiper-wrapper'>
            {videos.map((video, index) => {
              return (
                <div
                  key={index}
                  className='swiper-slide'
                  style={{ display: 'flex', flexDirection: 'column' }}>
                  {!video ? (
                    <Shimmer
                      key={index}
                      style={{ borderRadius: 8 }}
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
          {(hasNextPage || !swiperStatus.atEnd) && (
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
          {!swiperStatus.atBeginning && (
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
    </>
  )
})

function getCarouselPlayerId(id: string) {
  return '__carousel__player__' + id
}
