import React from 'react'
import style from './community.module.scss'
import HeadingComponent from '../../heading'
import content from '../../../../content/brands-page.json'
import community1 from '@images/business/brand-page/online-community-1.webp'
import { ContactUs } from '@components/common/modals/contact-us'
import { Button } from '@components/ui/button'

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
          <p className="text-new-para-1">{content.OnlineCommunity.caption}</p>
          <ContactUs>
            <Button size="custom" variant={'outline'} className="px-3 py-2">
              <p className="text-new-sm">{content.OnlineCommunity.button}</p>
            </Button>
          </ContactUs>
        </div>
      </div>

      {/* Comment: Row Two contains images */}
      <div className={style.rowTwo}>
        <div className={style.rowTwoLeft}>
          <img src={community1.src} loading="lazy" className="mt-6 h-[90vh]" fetchPriority="low" decoding="async" />
        </div>
      </div>
    </section>
  )
}
