import React, { useEffect, useState } from 'react'
import engagementHooks from '@images/business/brand-page/engagement-hooks.webp'
import interaction1 from '@images/business/brand-page/customer-engage/interaction-1.webp'
import interaction2 from '@images/business/brand-page/customer-engage/interaction-2.webp'
import interaction3 from '@images/business/brand-page/customer-engage/interaction-3.webp'
import Engagement1 from '@images/business/brand-page/customer-engage/engagement-1.webp'
import Engagement2 from '@images/business/brand-page/customer-engage/engagement-2.webp'
import Automation1 from '@images/business/brand-page/customer-engage/automation-1.webp'
import Automation2 from '@images/business/brand-page/customer-engage/automation-2.webp'

export default function EngagementHooks() {
  const [isSelected, setIsSelected] = useState<string | null>('Reactions')
  const [currentIndex, setCurrentIndex] = useState(0)

  const brandImages: any = [
    { title: 'Reactions', banner: interaction2 },
    { title: 'Comments', banner: interaction3 },
    { title: 'Link Share', banner: Engagement1 },
    { title: 'Feed', banner: interaction1 },
    { title: 'Challenge', banner: Engagement2 },
    { title: 'Rewards', banner: Automation1 },
    { title: 'Q&A', banner: Automation2 },
  ]

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex: any) => (prevIndex + 1) % brandImages?.length)
    }, 3000)

    return () => {
      clearInterval(intervalId)
    }
  }, [brandImages])

  useEffect(() => {
    setIsSelected(brandImages[currentIndex]?.title)
  }, [currentIndex])

  const handleThumbnailClick = (index: any, title: any) => {
    setCurrentIndex(index)
    setIsSelected(title)
  }

  return (
    <div className="my-40 flex w-full items-center">
      <div className="w-1/2">
        <p className="text-new-h2">Activate Proven Engagement Hooks to Keep Your Community Active</p>
        <p className="my-4 text-new-para-1">
          All the user engagement hooks of popular video-based social network are now in your hands
        </p>
      </div>
      <div className="flex w-1/2">
        <div className="flex w-3/5 justify-center">
          <img src={brandImages[currentIndex].banner.src} alt="genuin" />
        </div>
        <div className="grid-rows-7 flex w-2/5 flex-col justify-between">
          {brandImages.map((option: any, index: any) => (
            <p
              key={index}
              className={` text-center ${
                isSelected === option.title
                  ? 'text-new-h2 text-monochrome-black'
                  : ' text-new-h2-mobile font-medium text-[#949494]'
              }`}
              onClick={() => {
                handleThumbnailClick(index, option.title)
              }}>
              {option.title}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
