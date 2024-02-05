import React from 'react'
import style from './precision.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import customqr from '@images/business/marketing-page/customqr.webp'

export default function Precision() {
  return (
    <section className={style.container}>
      <div className={style.row}>
        <div className="w-1/2">
          <img loading="lazy" fetchPriority="low" decoding="async" src={customqr.src} alt="qr" />
          {/* <Image priority loading="eager" src={customqr} alt={'Email'} /> */}
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
