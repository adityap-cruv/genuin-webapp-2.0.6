import React from 'react'
import Image from 'next/image'
import Button from '../../button'
import style from './connections.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import socialConnections from '@images/business/marketing-page/social-connections.png'

export default function SocialConnections() {
  return (
    <section className={style.container}>
      <div className={style.firstRow}>
        <HeadingComponent headingLevel={2} title={content.SocialConnections.title} colorVariant={'black'} />
        <ParagraphComponent text={content.SocialConnections.caption} sizeVariant={'medium'} colorVariant={'black'} />
      </div>
      <div className={style.row}>
        <div className={style.col}>
          <Image
            priority
            loading="eager"
            src={socialConnections}
            alt={'Fuel Social Connections with Video Brilliance'}
          />
        </div>
        <div className={style.col}>
          {content?.SocialConnections.Engagement.map(({ title, caption, button }, index) => (
            <div className={style.colContainer} key={index}>
              {/* Heading Component */}
              <HeadingComponent headingLevel={4} title={title} colorVariant={'black'} />
              {/* Caption Component */}
              <ParagraphComponent text={caption} sizeVariant={'medium'} />
              {/* Get Started button */}
              <Button text={button} variant={'outline'} size={'small'} color={'black'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
