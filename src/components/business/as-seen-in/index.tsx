import React from 'react'
import style from './as-seen-in.module.scss'
import HeadingComponent from '@components/business/heading'
import businessInsider from '@images/business/marketing-page/as-seen-in/business-insider.png'
import yahoo from '@images/business/marketing-page/as-seen-in/yahoo.png'
import Link from 'next/link'
import { PATH_NAME } from '@lib/utils/constants/path'

export default function AsSeenIn() {
  return (
    <section className="bg-monochrome-9">
      <div className="container flex h-32 items-center justify-between">
        <HeadingComponent headingLevel={2} title={'As Seen In'} colorVariant={'black'} />
        <div className="flex gap-8">
          <div className={style.imageContainer}>
            <Link href={{ pathname: PATH_NAME.businessinsider() }}>
              <img loading="lazy" fetchPriority="low" decoding="async" src={businessInsider.src} alt="genuin" />
            </Link>
          </div>
          <div className={style.imageContainer}>
            <Link href={{ pathname: PATH_NAME.yahoo() }}>
              <img loading="lazy" fetchPriority="low" decoding="async" src={yahoo.src} alt="genuin" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
