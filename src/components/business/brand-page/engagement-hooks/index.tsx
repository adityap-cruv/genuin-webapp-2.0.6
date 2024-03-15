import React, { useEffect, useState } from 'react'
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
        <div className="relative flex w-3/5 justify-center">
          <img src={brandImages[currentIndex].banner.src} className="z-10 h-[500px] w-auto" alt="genuin" />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-full" viewBox="0 0 921 880" fill="none">
            <g filter="url(#filter0_f_5442_38746)">
              <path
                d="M658.97 383.321L494.195 397.977L503.333 337.087L200.141 200.914C216.796 350.718 250.43 652.071 251.725 659.05C253.345 667.775 346.125 684.266 346.522 677.822C346.918 671.377 352.702 542.36 357.56 498.457C362.419 454.554 430.231 543.898 474.564 576.813C518.897 609.728 724.766 540.462 720.123 528.317C716.409 518.601 677.806 427.605 658.97 383.321Z"
                fill="#E9CAF4"
              />
            </g>
            <defs>
              <filter
                id="filter0_f_5442_38746"
                x="0.140625"
                y="0.914062"
                width="920.06"
                height="878.366"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_5442_38746" />
              </filter>
            </defs>
          </svg>
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
