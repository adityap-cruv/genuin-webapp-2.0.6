import React from 'react'
import style from './support.module.scss'
import HeadingComponent from '@components/business/heading'
import ParagraphComponent from '@components/business/paragraph'
import { Button } from '@components/ui/button'
import { ContactUs } from '@components/common/modals/contact-us'

export default function Support() {
  return (
    <section className={style.container}>
      <div className={style.row}>
        <div className={style.col}>
          <HeadingComponent headingLevel={2} title={'Not sure which plan is right for you?'} colorVariant={'black'} />
          <ParagraphComponent
            text={
              'Contact us for support - we can help you find the plan that works best for you and your community. Contact us to get started!'
            }
            sizeVariant={'medium'}
            colorVariant={'black'}
          />
        </div>
        <div className={style.col}>
          <ContactUs>
            <Button
              size="index-page"
              variant="default"
              className="bg-new-off-black after:bg-new-dark-grey hover:bg-new-dark-grey">
              <p className="whitespace-nowrap text-new-sm text-monochrome-white">Book Demo</p>
            </Button>
          </ContactUs>
        </div>
      </div>
    </section>
  )
}
