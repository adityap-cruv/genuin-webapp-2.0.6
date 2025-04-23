import { type Swiper as SwiperType } from 'swiper/types'
import { Button } from '../ui/button'
import { cn } from '@/utils'
import { FeedVideoType } from '@/type'
import { ChevronDown } from '../icons/icon-down'
import { ChevronUp } from '../icons/icon-up'

type NavigationButtonsProps = {
  videos: FeedVideoType[]
  currentIndex: number
  swiperInstance: SwiperType | null
}

export const NavigationButtons = ({
  videos,
  currentIndex,
  swiperInstance,
}: NavigationButtonsProps) => {
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
        variant={'custom'}
        disabled={currentIndex === 0}
        className={cn(
          'flex-shrink-0 rounded-full bg-white/10 p-4 hover:bg-white/20',
          currentIndex === 0 ? 'opacity-40' : undefined,
        )}
        onClick={handleSwipeUp}>
        <ChevronUp className='h-5 w-5 stroke-white' />
      </Button>

      <Button
        variant={'custom'}
        disabled={currentIndex === videos?.length - 1}
        className={cn(
          'flex-shrink-0 rounded-full bg-white/10 p-4 hover:bg-white/20',
          currentIndex === videos?.length - 1 ? 'opacity-40' : undefined,
        )}
        onClick={handleSwipeDown}>
        <ChevronDown className='h-5 w-5 stroke-white' />
      </Button>
    </>
  )
}
