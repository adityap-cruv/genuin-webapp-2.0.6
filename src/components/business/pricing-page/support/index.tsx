import React from 'react'
import style from './support.module.scss'
import HeadingComponent from '@components/business/heading'
import ParagraphComponent from '@components/business/paragraph'
import Button from '@components/business/button'

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
          <Button text={'Book Demo'} variant={'solid'} size={'small'} color={'black'} />
        </div>
      </div>
    </section>
  )
}
