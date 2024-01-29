import React from 'react'
import Image from 'next/image'
import Button from '../../button'
import style from './impressions.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import SMS from '@images/business/marketing-page/sms.png'
import EmailBox from '@images/business/marketing-page/email-box.png'

export default function Impressions() {
  return (
    <section className={style.container}>
      {/* First Row with Heading and Caption */}
      <div className={style.firstRow}>
        <HeadingComponent headingLevel={2} title={content.Impressions.title} colorVariant={'black'} />
        <ParagraphComponent text={content.Impressions.caption} sizeVariant={'medium'} colorVariant={'black'} />
      </div>

      {/* Second Row with Images */}
      <div className={style.secondRow}>
        {/* SMS Image */}
        <div className={style.secondRowCol}>
          <Image priority loading="eager" src={SMS} alt={'SMS'} />
        </div>
        {/* Email Image */}
        <div className={style.secondRowCOl}>
          <Image priority loading="eager" src={EmailBox} alt={'Email'} />
        </div>
      </div>

      {/* Third Row with Engagement Items */}
      <div className={style.thirdRow}>
        {content?.Impressions.Engagement.map(({ title, caption, button }, index) => (
          <div className={style.thirdRowCol} key={index}>
            {/* Heading Component */}
            <HeadingComponent headingLevel={4} title={title} colorVariant={'black'} />
            {/* Caption Component */}
            <ParagraphComponent text={caption} sizeVariant={'medium'} />
            {/* Get Started button */}
            <Button text={button} variant={'outline'} size={'small'} color={'black'} />
          </div>
        ))}
      </div>
    </section>
  )
}
