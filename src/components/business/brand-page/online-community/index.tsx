import React from 'react'
import style from './community.module.scss'
import Button from '../../button'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/brands-page.json'
import community1 from '@images/business/brand-page/online-community-1.webp'
import community2 from '@images/business/brand-page/online-community-2.webp'

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
          <img src={community1.src} loading="lazy" fetchPriority="low" decoding="async" />
        </div>
        <div className={style.rowTwoRight}>
          <img src={community2.src} loading="lazy" fetchPriority="low" decoding="async" />
        </div>
      </div>
    </section>
  )
}
