import React from 'react'
import style from './hooks.module.scss'
import Button from '../../button'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/brands-page.json'
import engagementHooks from '@images/business/brand-page/engagement-hooks.webp'

export default function EngagementHooks() {
  return (
    // Container for the entire section
    <section className={style.container}>
      {/* Left section with an image */}
      <div className={style.sectionLeft}>
        {/* Display the image using Next.js Image component */}
        <img loading="lazy" decoding="async" fetchPriority="low" src={engagementHooks.src} alt="genuin" />
        {/* <Image priority loading="eager" src={engagementHooks} alt="genuin" /> */}
      </div>

      {/* Right section with text and a button */}
      <div className={style.sectionRight}>
        {/* Heading for the section */}
        <HeadingComponent headingLevel={2} title={content.EngagementHooks.title} colorVariant={'black'} />

        {/* Paragraph for the section */}
        <ParagraphComponent text={content.EngagementHooks.caption} sizeVariant={'medium'} colorVariant={'black'} />

        {/* Button for the section */}
        <Button text={content.EngagementHooks.button} variant={'outline'} size={'small'} color={'black'} />
      </div>
    </section>
  )
}
