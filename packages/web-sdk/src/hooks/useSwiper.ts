import { useBaseContext } from '@/context/base'
import { getSlidesPerView } from '@/utils'
import { SWIPER_CONFIG } from '@/utils/constants'
import React, { useEffect, useCallback } from 'react'
import { useDeviceDetect } from './useDeviceDetect'

export function useSwiper(selector: string, forFeed: boolean) {
  const { isWindows } = useDeviceDetect()
  const {
    videos,
    customizations,
    updateActiveIndex,
    shouldPlay,
    activeIndex,
    baseSwiperRef: swiperRef,
  } = useBaseContext()
  const [swiperStatus, setSwiperStatus] = React.useState<{
    atBeginning: boolean
    atEnd: boolean
  }>({
    atBeginning: true,
    atEnd: false,
  })

  useEffect(() => {
    if (shouldPlay === 'EMBED') return
    const swiper = swiperRef.current.swiper
    if (!swiper) return

    const ratio = swiperRef.current.ratio ?? 0
    const upperBound = Math.floor(swiper.activeIndex + ratio)
    if (!(activeIndex < upperBound && activeIndex >= swiper.activeIndex)) {
      swiper.slideTo(activeIndex)
    }
  }, [shouldPlay, activeIndex])

  useEffect(() => {
    const swiper = swiperRef.current.swiper
    if (swiper) {
      swiper.update()
      setSwiperStatus({ atBeginning: swiper.isBeginning, atEnd: swiper.isEnd })
    }
  }, [videos])

  useEffect(() => {
    const element = document.querySelector(selector)
    if (!element) return

    swiperRef.current.ratio = getSlidesPerView(element, forFeed)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const swiper = new Swiper(selector, {
      direction: forFeed ? 'vertical' : 'horizontal',
      slidesPerView: swiperRef.current.ratio,
      spaceBetween: 8,
      speed: SWIPER_CONFIG.SCROLL_DELAY,
      mousewheel: {
        forceToAxis: true,
        releaseOnEdges: true,
        thresholdDelta: isWindows
          ? SWIPER_CONFIG.MOUSE_THRESHOLD.WINDOWS
          : SWIPER_CONFIG.MOUSE_THRESHOLD.DEFAULT,
        thresholdTime: SWIPER_CONFIG.THRESHOLD_TIME,
        sensitivity: isWindows
          ? SWIPER_CONFIG.MOUSE_SENSITIVITY.WINDOWS
          : SWIPER_CONFIG.MOUSE_SENSITIVITY.DEFAULT,
      },
    })

    swiperRef.current.swiper = swiper

    swiper.on('reachEnd', () => {
      setSwiperStatus((x) => {
        x.atEnd = true
        return { ...x }
      })
    })

    swiper.on('activeIndexChange', handleSwiperActiveIndexChange)

    return () => {
      swiper.destroy()
    }
  }, [])

  const handleActivationOfSwiper = useCallback(() => {
    const swiper = swiperRef.current.swiper
    if (!swiper) return
    swiper.enable()
    const ratio = swiperRef.current.ratio ?? 0
    const upperBound = Math.floor(swiper.activeIndex + ratio)
    if (!(activeIndex < upperBound && activeIndex >= swiper.activeIndex)) {
      swiper.slideTo(activeIndex)
    }
  }, [activeIndex])

  useEffect(() => {
    // If shouldPlay is none than don't perform any action
    if (shouldPlay === 'NONE') return
    if (shouldPlay !== 'EMBED') {
      swiperRef.current.swiper?.disable()
    } else {
      handleActivationOfSwiper()
    }
  }, [shouldPlay])

  function handleSwiperActiveIndexChange(swiper: any) {
    const ratio = swiperRef.current.ratio ?? 0
    setSwiperStatus((x) => {
      if (swiper.isBeginning !== x.atBeginning || swiper.atEnd !== x.atEnd) {
        x.atBeginning = swiper.isBeginning
        x.atEnd = swiper.isEnd
        return { ...x }
      }
      return x
    })
    updateActiveIndex((activeIndex) => {
      if (activeIndex < swiper.activeIndex) return swiper.activeIndex
      const upperBound = Math.floor(swiper.activeIndex + ratio)
      if (activeIndex >= upperBound) {
        return upperBound - 1
      }
      return activeIndex
    })
  }

  function handleSwipeNext() {
    const swiper = swiperRef.current.swiper
    if (swiper) {
      swiper.slideNext()
    }
  }

  function handleSwipePrev() {
    const swiper = swiperRef.current.swiper
    if (swiper) {
      swiper.slidePrev()
    }
  }

  function handleOnEnded(e: any, index: number) {
    if (!customizations?.is_loop_video) {
      const swiper = swiperRef.current.swiper
      const ratio = swiperRef.current.ratio ?? 0
      const upperBound = Math.floor(swiper.activeIndex + ratio)
      if (index + 1 >= upperBound) {
        swiper.slideNext()
      }
      updateActiveIndex(index + 1)
    }
  }

  function handleOnHoverOfPlayer(index: number) {
    const swiper = swiperRef.current.swiper
    const ratio = swiperRef.current.ratio ?? 0
    const upperBound = Math.floor(swiper.activeIndex + ratio)
    if (index >= upperBound) {
      return
    }
    updateActiveIndex(index)
  }

  return {
    swiperStatus,
    handleSwipeNext,
    handleSwipePrev,
    handleOnEnded,
    handleOnHoverOfPlayer,
  }
}
