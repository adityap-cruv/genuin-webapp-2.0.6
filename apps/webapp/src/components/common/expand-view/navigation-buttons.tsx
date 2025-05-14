import React from 'react'
import { Button } from '../../ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { type VideoPlayerModalType } from '@/lib/schemas/player/video'
import { type Swiper as SwiperType } from 'swiper/types'

interface FullScreenCommentBoxProps {
  videos: VideoPlayerModalType[]
  currentIndex: number
  swiperInstance: SwiperType | null
}

const NavigationButtons = ({ videos, currentIndex, swiperInstance }: FullScreenCommentBoxProps) => {
  const handleSwipeUp = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev() // Moves to the previous slide
    }
  }

  const handleSwipeDown = () => {
    if (swiperInstance) {
      swiperInstance.slideNext() // Moves to the next slide
    }
  }

  return (
    <>
      <Button
        disabled={currentIndex === 0}
        className={cn(
          'flex-shrink-0 rounded-full bg-monochrome-white/10 p-3 hover:bg-monochrome-white/20',
          currentIndex === 0 ? 'opacity-40' : undefined
        )}
        onClick={handleSwipeUp}>
        <ChevronUp className="h-8 w-8" />
      </Button>

      <Button
        disabled={currentIndex === videos.length - 1}
        className={cn(
          'flex-shrink-0 rounded-full bg-monochrome-white/10 p-3 hover:bg-monochrome-white/20',
          currentIndex === videos?.length - 1 ? 'opacity-40' : undefined
        )}
        onClick={handleSwipeDown}>
        <ChevronDown className="h-8 w-8" />
      </Button>
    </>
  )
}

export default NavigationButtons
