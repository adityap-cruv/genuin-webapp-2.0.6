import React from 'react'
import Button from '../../button'
import style from './precision.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import precision from '@images/business/marketing-page/precision.webp'
import Image from 'next/image'

export default function Precision() {
  return (
    <section className={style.container}>
      <div className={style.row}>
        <div className={style.col}>
          <HeadingComponent headingLevel={2} title={content.Precision.title} colorVariant={'black'} />
          <ParagraphComponent text={content.Precision.caption} sizeVariant={'medium'} colorVariant={'black'} />
          <Button text={content.Precision.button} variant={'outline'} size={'small'} color={'black'} />
        </div>
        <div className={style.col}>
          {/* <img loading="lazy" fetchPriority="low" decoding="async" src={precision.src} alt="precision" /> */}
          <Image loading="lazy" src={precision} alt={'Email'} />
        </div>
      </div>
    </section>
  )
}
