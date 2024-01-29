import React from 'react'
import Image from 'next/image'
import Button from '../../button'
import style from './communities.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import communities1 from '@images/business/marketing-page/communities-1.png'
import communities2 from '@images/business/marketing-page/communities-2.png'

export default function Communities() {
  return (
    <section className={style.container}>
      <div className={style.firstRow}>
        <HeadingComponent headingLevel={2} title={content.Communities.title} colorVariant={'black'} />
        <div style={{ margin: '10px 0' }}></div>
        <ParagraphComponent text={content.Communities.caption} sizeVariant={'medium'} colorVariant={'black'} />
        <Button text={content.Communities.button} variant={'outline'} size={'small'} color={'black'} />
      </div>

      <div className={style.secondRow}>
        <Image priority loading="eager" src={communities1} alt={'communities1'} />
        <Image priority loading="eager" src={communities2} alt={'communities2'} />
      </div>
    </section>
  )
}
