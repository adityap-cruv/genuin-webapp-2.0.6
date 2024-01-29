'use client'
import React from 'react'
import style from './planDetails.module.scss'
import HeadingComponent from '@components/business/heading'
import ParagraphComponent from '@components/business/paragraph'
import Button from '@components/business/button'

export default function PlanDetails() {
  return (
    <section className={style.container}>
      <div className={style.innerContainer}>
        <div className={style.firstRow}>
          <HeadingComponent headingLevel={2} title={'Pro Plan'} colorVariant={'white'} />
        </div>

        <div className={style.secondRow}>
          <div className={style.secondRowLeft}>
            <HeadingComponent
              headingLevel={2}
              title={'Want more customization from our basic plans?'}
              colorVariant={'black'}
            />
            <ParagraphComponent
              text={'With pro plan, you’ll get the white label capabilities with your own URL. '}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
            <div className={style.buttonContainer}>
              <Button text={'Contact us for pricing'} variant={'solid'} size={'small'} color={'black'} />
            </div>
          </div>
          <div className={style.secondRowRIght}>
            <HeadingComponent headingLevel={4} title={'What do you get from a pro plan?'} colorVariant={'black'} />
            <ParagraphComponent
              text={'White label ability with your own URL AI tools'}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
          </div>
        </div>
      </div>
      <div className={style.innerContainer}>
        <div className={style.firstRow}>
          <HeadingComponent headingLevel={2} title={'Enterprise Plan'} colorVariant={'white'} />
        </div>

        <div className={style.secondRow}>
          <div className={style.secondRowLeft}>
            <HeadingComponent
              headingLevel={2}
              title={'Are you a big enterprise that need fully customized community solution?'}
              colorVariant={'black'}
            />
            <ParagraphComponent
              text={'With enterprise plan, Genuin will curate a solution for you'}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
            <div className={style.buttonContainer}>
              <Button text={'Contact us for demo and pricing'} variant={'solid'} size={'small'} color={'black'} />
              <Button text={'Read Case Studies'} variant={'outline'} size={'small'} color={'black'} />
            </div>
          </div>
          <div className={style.secondRowRIght}>
            <HeadingComponent
              headingLevel={4}
              title={'What do you get from a enterprise plan?'}
              colorVariant={'black'}
            />
            <ParagraphComponent
              text={'Full white label capability with your URL Data in your own warehouse'}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
            <ParagraphComponent
              text={'Advanced analytics tools and insights'}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
            <ParagraphComponent
              text={'AI moderation and management tools for brand'}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
            <ParagraphComponent
              text={'AIGH assistance to engage and grow your audience'}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
