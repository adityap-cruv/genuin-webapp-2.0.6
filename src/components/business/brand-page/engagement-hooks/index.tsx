import React, { useState } from 'react'
import style from './hooks.module.scss'
import Button from '../../button'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/brands-page.json'
import engagementHooks from '@images/business/brand-page/engagement-hooks.webp'

export default function EngagementHooks() {
  const [isHovered, setIsHoverd] = useState<string | null>('Feed')
  const options = ['Reactions', 'Comments', 'Link Share', 'Feed', 'Challenge', 'Rewards', 'Q&A']
  return (
    <div className="my-40 flex w-full items-center">
      <div className="w-1/2">
        <p className="text-new-h2">Activate Proven Engagement Hooks to Keep Your Community Active</p>
        <p className="my-4 text-new-para-1">
          All the user engagement hooks of popular video-based social network are now in your hands
        </p>
      </div>
      <div className="flex w-1/2">
        <div className="w-3/5">
          <img src={engagementHooks.src} alt="genuin" />
        </div>
        <div className="grid-rows-7 flex w-2/5 flex-col justify-between">
          {options.map((option) => (
            <p
              key={option}
              className={` text-center ${
                isHovered === option
                  ? 'text-new-h2 text-monochrome-black'
                  : ' text-new-h2-mobile font-medium text-[#949494]'
              }`}
              onMouseEnter={() => {
                setIsHoverd(option)
              }}>
              {option}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
