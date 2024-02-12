import React from 'react'
import Button from '../../button'
import style from './precision.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import precision from '@images/business/marketing-page/precision.webp'
import customqr from '@images/business/marketing-page/customqr.webp'
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

      <div className={`${style.row} mt-20`}>
        <div className="w-1/2">
          {/* <img loading="lazy" fetchPriority="low" decoding="async" src={customqr.src} alt="qr" /> */}
          <Image loading="lazy" src={customqr} alt={'Email'} />
        </div>
        <div className="w-1/2">
          <HeadingComponent
            headingLevel={2}
            title={'Custom QR code generation to grow your community on digital and physical media'}
            colorVariant={'black'}
          />
          <ParagraphComponent
            text={'Elevate Engagement and Attention with Genuin AdReels.'}
            sizeVariant={'medium'}
            colorVariant={'black'}
          />
        </div>
      </div>
    </section>
  )
}
