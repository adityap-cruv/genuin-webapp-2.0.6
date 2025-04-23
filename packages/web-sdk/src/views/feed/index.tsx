import { EmbedShell } from '@/components/embed-shell'
import { useBaseContext } from '@/context/base'
import { EmbedPlayer } from '@/components/player/embed'
import { EmbedHeader } from '@/components/embed-header'
import { getIconLink } from '@/utils'
import { useSwiper } from '@/hooks/useSwiper'
import { memo } from 'react'
import { Shimmer } from '@/components/shimmer'

const FEED_LIST_SWIPER_CLASS = '__gen__feed__list__swiper__class__'

export const Feed = memo(() => {
  return (
    <EmbedShell Header={Header}>
      <SwiperRenderer />
    </EmbedShell>
  )
})

function Header() {
  return (
    <EmbedHeader
      style={{ width: 'initial', padding: '8px 16px 16px 16px' }}
      forFeed
    />
  )
}

function SwiperRenderer() {
  const { customizations, videos, hasNextPage } = useBaseContext()
  const {
    handleOnEnded,
    handleOnHoverOfPlayer,
    handleSwipeNext,
    handleSwipePrev,
    swiperStatus,
  } = useSwiper(`.${FEED_LIST_SWIPER_CLASS}`, true)
  const hasHeadings = customizations?.heading || customizations?.sub_heading

  return (
    <div
      className={`${FEED_LIST_SWIPER_CLASS} swiper`}
      style={{
        height: '100%',
        width: '100%',
        flexGrow: 1,
        display: 'flex',
      }}>
      <div
        className='swiper-wrapper'
        style={{ padding: '0px 16px', boxSizing: 'border-box' }}>
        {videos.map((item, index) => {
          return (
            <div
              className='swiper-slide'
              key={index}>
              {!item ? (
                <Shimmer
                  style={{ height: '100%', width: '100%', borderRadius: 8 }}
                />
              ) : (
                <EmbedPlayer
                  id={getFeedPlayerId(item.uuid)}
                  index={index}
                  videoData={item}
                  onHover={handleOnHoverOfPlayer}
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
      <div
        style={{
          position: 'absolute',
          right: 24,
          top: '50%',
          zIndex: 1,
          transform: 'translate(0px, -50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginTop: hasHeadings ? 24 : undefined,
        }}>
        {!swiperStatus.atBeginning && (
          <div
            className='__gen__sdk__flex__center __gen__sdk__feed__navigation__icon'
            onClick={(e) => {
              e.stopPropagation()
              handleSwipePrev()
            }}>
            <img
              src={getIconLink('icChevronUpBlack')}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )}
        {(hasNextPage || !swiperStatus.atEnd) && (
          <div
            className='__gen__sdk__flex__center __gen__sdk__feed__navigation__icon'
            onClick={(e) => {
              e.stopPropagation()
              handleSwipeNext()
            }}>
            <img
              src={getIconLink('icChevronDownBlack')}
              style={{ width: 20, height: 20 }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function getFeedPlayerId(uuid: string) {
  return `__gen__sdk__feed__player__${uuid}`
}
