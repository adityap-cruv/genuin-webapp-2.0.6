import React from 'react'
import Image from 'next/image'
import style from './community.module.scss'
import Button from '../../button'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/brands-page.json'
import community1 from '@images/business/brand-page/online-community-1.png'
import community2 from '@images/business/brand-page/online-community-2.png'

export default function OnlineCommunity() {
  // Comment: The main component for the "Online Community" section on the homepage.

  return (
    <section className={style.container}>
      {/* Comment: Row One contains the title, caption, and button */}
      <div className={style.rowOne}>
        <div className={style.rowOneLeft}>
          <HeadingComponent headingLevel={2} title={content.OnlineCommunity.title} colorVariant={'black'} />
        </div>
        <div className={style.rowOneRight}>
          <ParagraphComponent text={content.OnlineCommunity.caption} sizeVariant={'medium'} colorVariant={'black'} />
          <Button text={content.OnlineCommunity.button} variant={'outline'} size={'small'} color={'black'} />
        </div>
      </div>

      {/* Comment: Row Two contains images */}
      <div className={style.rowTwo}>
        <div className={style.rowTwoLeft}>
          <Image priority loading="eager" src={community1} alt="genuin" />
        </div>
        <div className={style.rowTwoRight}>
          <Image priority loading="eager" src={community2} alt="genuin" />
        </div>
      </div>
    </section>
  )
}
