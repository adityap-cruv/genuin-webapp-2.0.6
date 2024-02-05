'use client'
import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Button from '../../button'
import style from './connections.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/marketing-page.json'
import socialConnections1 from '@images/business/marketing-page/connections/socialConnections1.webp'
import socialConnections2 from '@images/business/marketing-page/connections/socialConnections2.webp'
import socialConnections3 from '@images/business/marketing-page/connections/social-connections.webp'

gsap.registerPlugin(ScrollTrigger)

const FunnelEngagement: React.FC = () => {
  // const [progressValue, setProgressValue] = useState(0)
  const [activeElementIndex, setActiveElementIndex] = useState(0)
  const app = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const shapes = gsap.utils.toArray('.left-content svg')
    const rightColumn = document.querySelector('.right-content')
    const rightElements = gsap.utils.toArray('.right-content .right-element')
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.container',
          start: 'top top+=50',
          end: '+=300%',
          pin: true,
          // @ts-expect-error type
          duration: 1,
          scrub: true,
          // markers: true,
          onUpdate: (self) => {
            // Update your progress bar based on the self.progress value
            // const progressBar = document.getElementById('progressBar')
            // if (progressBar) {
            //   setProgressValue(self.progress * 100)
            //   //@ts-ignore
            //   progressBar.value = self.progress * 100
            // }
            // Calculate the active right-element based on the progress
            const newActiveElementIndex = Math.floor(self.progress * rightElements.length)
            setActiveElementIndex(newActiveElementIndex)
          },
        },
      })

      shapes.forEach((shape, i) => {
        if (shapes[i + 1]) {
          // @ts-expect-error type
          tl.to(shapes[i + 1], { opacity: 1 }, '+=0.1')
        }
      })

      tl.to(
        rightColumn,
        {
          // @ts-expect-error type
          y: () => window.innerHeight - rightColumn.clientHeight,
          duration: tl.duration(),
          ease: 'none',
        },
        0.1
      )

      tl.to({}, { duration: 0.1 })
    }, app)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <>
      <section ref={app}>
        <div className={`container ${style.container}`}>
          <div className="text-center">
            <HeadingComponent headingLevel={2} title={content.SocialConnections.title} colorVariant={'black'} />
            <ParagraphComponent
              text={content.SocialConnections.caption}
              sizeVariant={'medium'}
              colorVariant={'black'}
            />
          </div>
          <div className="flex">
            <div className="flex w-1/2 items-center justify-center">
              {activeElementIndex === 2 || activeElementIndex === 3 ? (
                <img loading="lazy" fetchPriority="low" decoding="async" src={socialConnections3.src} alt="genuin" />
              ) : // <Image priority loading="eager" src={socialConnections3} alt="learn" />
              activeElementIndex === 1 ? (
                <img loading="lazy" fetchPriority="low" decoding="async" src={socialConnections2.src} alt="genuin" />
              ) : (
                // <Image priority loading="eager" src={socialConnections2} alt="discover" />
                <img loading="lazy" fetchPriority="low" decoding="async" src={socialConnections1.src} alt="genuin" />
                // <Image priority loading="eager" src={socialConnections1} alt="connect" />
              )}
            </div>
            <div className={style.rightContainer}>
              <div className={style.rightInnerContainer}>
                <div
                  className={
                    activeElementIndex === 0
                      ? `${style.rightElementBlock} ${style.active}`
                      : `${style.rightElementBlock}`
                  }>
                  {/* Heading Component */}
                  <HeadingComponent
                    headingLevel={4}
                    title={content.SocialConnections.Engagement[0].title}
                    colorVariant={'black'}
                  />
                  {/* Caption Component */}
                  <ParagraphComponent text={content.SocialConnections.Engagement[0].caption} sizeVariant={'medium'} />
                  {/* Get Started button */}
                  <div className="mt-2">
                    <Button
                      text={content.SocialConnections.Engagement[0].button}
                      variant={'outline'}
                      size={'small'}
                      color={'black'}
                    />
                  </div>
                </div>
                <div
                  className={
                    activeElementIndex === 1
                      ? `${style.rightElementBlock} ${style.active}`
                      : `${style.rightElementBlock}`
                  }>
                  {/* Heading Component */}
                  <HeadingComponent
                    headingLevel={4}
                    title={content.SocialConnections.Engagement[1].title}
                    colorVariant={'black'}
                  />
                  {/* Caption Component */}
                  <ParagraphComponent text={content.SocialConnections.Engagement[1].caption} sizeVariant={'medium'} />
                  {/* Get Started button */}
                  <div className="mt-2">
                    <Button
                      text={content.SocialConnections.Engagement[0].button}
                      variant={'outline'}
                      size={'small'}
                      color={'black'}
                    />
                  </div>
                </div>
                <div
                  className={
                    activeElementIndex === 2 || activeElementIndex === 3
                      ? `${style.rightElementBlock} ${style.active}`
                      : `${style.rightElementBlock}`
                  }>
                  {/* Heading Component */}
                  <HeadingComponent
                    headingLevel={4}
                    title={content.SocialConnections.Engagement[2].title}
                    colorVariant={'black'}
                  />
                  {/* Caption Component */}
                  <ParagraphComponent text={content.SocialConnections.Engagement[2].caption} sizeVariant={'medium'} />
                  {/* Get Started button */}
                  <div className="mt-2">
                    <Button
                      text={content.SocialConnections.Engagement[0].button}
                      variant={'outline'}
                      size={'small'}
                      color={'black'}
                    />
                  </div>
                </div>
              </div>
              <div className={`right-content`}>
                <div className={`right-element ${style.rightElement}`}></div>
                <div className={`right-element ${style.rightElement}`}></div>
                <div className={`right-element ${style.rightElement}`}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default FunnelEngagement
