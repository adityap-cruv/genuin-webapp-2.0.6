import React from 'react'
import Button from '../../button'
import style from './communities.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import communities1 from '@images/business/marketing-page/communities-1.webp'

export default function Communities() {
  return (
    <section className={style.container}>
      <div className={style.firstRow}>
        <HeadingComponent headingLevel={2} title={content.Communities.title} colorVariant={'black'} />
        <ParagraphComponent text={content.Communities.caption} sizeVariant={'medium'} colorVariant={'black'} />
        {/* <Button text={content.Communities.button} variant={'outline'} size={'small'} color={'black'} /> */}
      </div>

      <div className={style.secondRow}>
        <img loading="lazy" fetchPriority="low" decoding="async" src={communities1.src} alt="genuin" />
      </div>
    </section>
  )
}
