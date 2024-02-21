'use client'
import React, { useEffect } from 'react'
import style from './getintuch.module.scss'
import HeadingComponent from '@components/business/heading'
import ParagraphComponent from '@components/business/paragraph'
import InlineButtonInput from '@components/business/input'
import content from '../../../../content/brands-page.json'
import getInTouch from '@images/business/brand-page/get-in-touch.webp'

export default function GetInTouch() {
  const handleButtonClick = (value: string) => {
    // console.log('Input value:', value)
  }
  useEffect(() => {
    // Attach event handler only if running on the client side
    if (typeof window !== 'undefined') {
      // @ts-expect-errorts overload
      document.addEventListener('click', handleButtonClick)

      // Clean up the event handler on component unmount
      return () => {
        // @ts-expect-errorts overload
        document.removeEventListener('click', handleButtonClick)
      }
    }
  }, [])
  return (
    <div className="my-32 flex w-full rounded-2xl bg-[#E9CAF4]">
      <div className="w-2/3 p-16">
        <HeadingComponent headingLevel={2} title={content.GetInTouch.title} colorVariant={'black'} />
        <ParagraphComponent text={content.GetInTouch.caption} sizeVariant={'medium'} colorVariant={'black'} />
        <InlineButtonInput onButtonClick={handleButtonClick} />
      </div>

      <div className="flex w-4/12 flex-shrink-0 items-end">
        <img loading="lazy" fetchPriority="low" decoding="async" src={getInTouch.src} alt="genuin" />
      </div>
    </div>
  )
}
