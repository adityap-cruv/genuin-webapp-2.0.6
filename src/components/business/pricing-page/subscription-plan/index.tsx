'use client'
import React from 'react'
import style from './subscriptionPlan.module.scss'
import HeadingComponent from '@components/business/heading'
import ParagraphComponent from '@components/business/paragraph'
import Button from '@components/business/button'
import Image from 'next/image'
import fastStart from '@icons/business/fast-start.svg'
import elite from '@icons/business/user.svg'
import star from '@icons/business/star.svg'

export default function SubscriptionPlan() {
  return (
    <section className={style.container}>
      <div className={style.firstRow}>
        <h2 className={style.h2}>
          A Plan
          <br /> <span>For Every Goal</span> on Genuin
        </h2>
      </div>

      <div className={style.secondRow}>
        <div className={style.secondRowLeft}>
          <div className={style.choosePlan}>
            <ParagraphComponent text={'Choose Your Plan'} sizeVariant={'medium'} colorVariant={'black'} />
            <div className={style.rangeSlider}>
              <div className={style.sliderContainer}>
                <input type="range" min="0" max="4" className={style.slider} />
              </div>
              <div className={style.labelContainer}>
                <div className={style.labelSlider}>Free</div>
                <div className={style.labelSlider}>Starter</div>
                <div className={style.labelSlider}>Essential</div>
                <div className={style.labelSlider}>Pro</div>
                <div className={style.labelSlider}>Enterprise</div>
              </div>
              <div className={style.ticks}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
          <div className={style.mainContainer}>
            <div className={style.boxContainer}>
              <div className={style.boxHead}>
                <div className={style.boxHeadTitle}>
                  <HeadingComponent headingLevel={4} title={'Starter Plan'} colorVariant={'black'} />
                  <Image priority loading="eager" src={fastStart} width={24} height={24} alt="Check" />
                  <ParagraphComponent text={'Fast start'} sizeVariant={'medium'} colorVariant={'green'} />
                </div>
                <ParagraphComponent
                  text={'FOR COMMUNITY BUILDERS'}
                  sizeVariant={'medium'}
                  colorVariant={'black'}
                  fontWeight={600}
                />
                <ParagraphComponent
                  text={'Starter plan is the plan that XX XXXX'}
                  sizeVariant={'small'}
                  colorVariant={'black'}
                />
              </div>
              <div className={style.boxBody}>
                <div className={style.price}>
                  <HeadingComponent headingLevel={4} title={`$${39}`} colorVariant={'black'} />
                  <ParagraphComponent text={'/month'} sizeVariant={'small'} colorVariant={'black'} />
                </div>
                <Button text={'Sign up now'} variant={'solid'} size={'small'} color={'black'} />
              </div>
              <div className={style.boxFooter}>
                <ParagraphComponent text={'Benefits:'} sizeVariant={'medium'} colorVariant={'black'} fontWeight={600} />
                <div className={style.boxFooterList}>
                  <ParagraphComponent
                    text={'Basic community tools to boost your community'}
                    sizeVariant={'medium'}
                    colorVariant={'black'}
                  />
                  <ParagraphComponent
                    text={'Basic moderation tools to keep community'}
                    sizeVariant={'medium'}
                    colorVariant={'black'}
                  />
                  <ParagraphComponent text={'Genuin watermark'} sizeVariant={'medium'} colorVariant={'black'} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={style.secondRowRIght}>
          <div className={style.rightBox}>
            <div className={style.rightBoxHead}>
              <HeadingComponent headingLevel={4} title={'Free Plan'} colorVariant={'black'} />
              <ParagraphComponent text={'Free forever'} sizeVariant={'medium'} colorVariant={'green'} />
            </div>
            <div className={style.rightBoxBody}>
              <ParagraphComponent
                text={'FOR EVERYONE TO START'}
                sizeVariant={'medium'}
                colorVariant={'black'}
                fontWeight={600}
              />
              <ParagraphComponent
                text={'Start at no cost, wether you are an aspiring community builder or are trying out Genuin.'}
                sizeVariant={'small'}
                colorVariant={'black'}
              />
            </div>
            <div className={style.buttonContainer}>
              <Button text={'Start now for free'} variant={'outline'} size={'small'} color={'black'} />
            </div>
            <div className={style.rightBoxFooter}>
              <ParagraphComponent text={'Genuin watermark'} sizeVariant={'medium'} colorVariant={'black'} />
              <ParagraphComponent text={'Genuin watermark'} sizeVariant={'medium'} colorVariant={'black'} />
              <ParagraphComponent text={'Genuin watermark'} sizeVariant={'medium'} colorVariant={'black'} />
            </div>
          </div>
          <div className={style.rightBox}>
            <div className={style.rightBoxHead}>
              <HeadingComponent headingLevel={4} title={'Pro Plan'} colorVariant={'black'} />
              <Image priority loading="eager" src={star} width={24} height={24} alt="Star" />
              <ParagraphComponent text={'Recommended'} sizeVariant={'medium'} colorVariant={'green'} />
            </div>
            <div className={style.rightBoxBody}>
              <ParagraphComponent
                text={'With pro plan, you’ll get the white label capabilities with your own URL.'}
                sizeVariant={'small'}
                colorVariant={'black'}
              />
            </div>
            <div className={style.rightBoxFooter}>
              <ParagraphComponent
                text={'White label ability with your own URL'}
                sizeVariant={'medium'}
                colorVariant={'black'}
              />
              <ParagraphComponent text={'AI tools'} sizeVariant={'medium'} colorVariant={'black'} />
            </div>
          </div>
          <div className={style.rightBox}>
            <div className={style.rightBoxHead}>
              <HeadingComponent headingLevel={4} title={'Enterprise Plan'} colorVariant={'black'} />
              <Image priority loading="eager" src={elite} width={24} height={24} alt="Elite" />
              <ParagraphComponent text={'Elite'} sizeVariant={'medium'} colorVariant={'silver'} />
            </div>
            <div className={style.rightBoxBody}>
              <ParagraphComponent
                text={'With enterprise plan, Genuin will curate a solution for you'}
                sizeVariant={'small'}
                colorVariant={'black'}
              />
            </div>
            <div className={style.rightBoxFooter}>
              <ParagraphComponent
                text={'Full white label capability with your URL'}
                sizeVariant={'medium'}
                colorVariant={'black'}
              />
              <ParagraphComponent text={'Data in your own warehouse'} sizeVariant={'medium'} colorVariant={'black'} />
              <ParagraphComponent
                text={'Advanced analytics tools and insights'}
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
      </div>
    </section>
  )
}
