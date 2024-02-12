import React from 'react'
import style from './as-seen-in.module.scss'
import HeadingComponent from '@components/business/heading'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'

export default function AsSeenIn() {
  return (
    <section className="bg-monochrome-9">
      <div className={style.container}>
        <HeadingComponent headingLevel={2} title={'As Seen In'} colorVariant={'black'} />
        <div className="flex gap-8">
          <div className={style.imageContainer}>
            <img loading="lazy" fetchPriority="low" decoding="async" src={businessInsider.src} alt="genuin" />
          </div>
          <div className={style.imageContainer}>
            <img loading="lazy" fetchPriority="low" decoding="async" src={yahoo.src} alt="genuin" />
          </div>
        </div>
      </div>
    </section>
  )
}
