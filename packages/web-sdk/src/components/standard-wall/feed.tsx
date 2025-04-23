import { useBaseContext } from '@/context/base'
import { StandardWallList } from './list'
import { GestureProvider } from '../gestures/context'
import ConditionalWrapper from '../conditional-wrapper'

const STANDARD_WALL_LIST_ID = '__gen__sdk__standard-wall__list__class'

export function Feed() {
  const {
    videos,
    baseSwiperRef: swiperRef,
    updateActiveIndex,
    activeIndex,
    shouldPlay,
    brandDetails,
  } = useBaseContext()

  // Check if gesture guidance is enabled
  const isGestureGuidanceEnabled =
    brandDetails?.web_configs?.gesture_guidance ?? false

  return (
    <ConditionalWrapper
      condition={isGestureGuidanceEnabled}
      wrapper={(children) => <GestureProvider>{children}</GestureProvider>}>
      <StandardWallList
        videoShouldPlay={shouldPlay === 'STANDARD_WALL'}
        activeIndex={activeIndex}
        onActiveIndexChange={(activeIndex) => {
          updateActiveIndex(activeIndex)
        }}
        onInit={(swiper) => {
          swiperRef.current.swiper = swiper
        }}
        swiperElementId={STANDARD_WALL_LIST_ID}
        videos={videos}
      />
    </ConditionalWrapper>
  )
}
