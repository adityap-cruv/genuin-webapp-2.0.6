'use client'
import React, { useState } from 'react'
import style from './impressions.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
// import SMS from '@images/business/marketing-page/sms.webp'
// import EmailBox from '@images/business/marketing-page/email-box.webp'
import SMSTab from '@images/business/marketing-page/sms-engagement.webp'
import EmailBoxTab from '@images/business/marketing-page/email-engagement.webp'
import Image from 'next/image'

export default function Impressions() {
  const [isHovered, setIsHovered] = useState<null | string>('sms')
  return (
    <section className={style.container}>
      {/* First Row with Heading and Caption */}
      <div className={style.firstRow}>
        <HeadingComponent headingLevel={2} title={content.Impressions.title} colorVariant={'black'} />
        <ParagraphComponent text={content.Impressions.caption} sizeVariant={'medium'} colorVariant={'black'} />
      </div>

      {isHovered === 'sms' ? (
        // <img loading="lazy" fetchPriority="low" decoding="async" src={SMSTab.src} alt="sms" />
        <Image priority loading="eager" src={SMSTab} alt={'Email'} />
      ) : (
        // <img loading="lazy" fetchPriority="low" decoding="async" src={EmailBoxTab.src} alt="email" />
        <Image priority loading="eager" src={EmailBoxTab} alt={'Email'} />
      )}

      {/* Third Row with Engagement Items */}
      <div className={style.thirdRow}>
        {content && (
          <>
            <div
              className={style.thirdRowCol}
              onMouseEnter={() => {
                setIsHovered('sms')
              }}>
              {/* Heading Component */}
              <div className={isHovered === 'sms' ? style.topLineHovered : style.topLine}>
                <HeadingComponent
                  headingLevel={4}
                  title={content?.Impressions.Engagement[0].title}
                  colorVariant={'black'}
                />
              </div>
              {/* Caption Component */}
              <ParagraphComponent text={content?.Impressions.Engagement[0].caption} sizeVariant={'medium'} />
              {/* Get Started button */}
              {/* <Button
                text={content?.Impressions.Engagement[0].button}
                variant={'outline'}
                size={'small'}
                color={'black'}
              /> */}
            </div>

            <div
              className={style.thirdRowCol}
              onMouseEnter={() => {
                setIsHovered('email')
              }}>
              {/* Heading Component */}
              <div className={isHovered === 'email' ? style.topLineHovered : style.topLine}>
                <HeadingComponent
                  headingLevel={4}
                  title={content?.Impressions.Engagement[1].title}
                  colorVariant={'black'}
                />
              </div>
              {/* Caption Component */}
              <ParagraphComponent text={content?.Impressions.Engagement[1].caption} sizeVariant={'medium'} />
              {/* Get Started button */}
              {/* <Button
                text={content?.Impressions.Engagement[1].button}
                variant={'outline'}
                size={'small'}
                color={'black'}
              /> */}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
