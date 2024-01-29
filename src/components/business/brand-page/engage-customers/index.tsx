'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Image from 'next/image'
import HeadingComponent from '@components/business/heading'
import ParagraphComponent from '@components/business/paragraph'
import content from '../../../../content/brands-page.json'
import interaction1 from '@images/business/brand-page/customer-engage/interaction-1.png'
import interaction2 from '@images/business/brand-page/customer-engage/interaction-2.png'
import interaction3 from '@images/business/brand-page/customer-engage/interaction-3.png'
import Engagement1 from '@images/business/brand-page/customer-engage/engagement-1.png'
import Engagement2 from '@images/business/brand-page/customer-engage/engagement-2.png'
import Automation1 from '@images/business/brand-page/customer-engage/automation-1.png'
import Automation2 from '@images/business/brand-page/customer-engage/automation-2.png'
import style from './customer.module.scss'

gsap.registerPlugin(ScrollTrigger)

const EngageCustomers: React.FC = () => {
  const [progressValue, setProgressValue] = useState(0)
  const component: any = useRef()
  const slider: any = useRef()

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray('.panel')
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: slider.current,
          pin: true,
          scrub: 1,
          snap: 1 / (panels.length - 1),
          start: 'top top+=230',
          end: () => '+=' + slider.current.offsetWidth,
          onUpdate: (self) => {
            // Update your progress bar based on the self.progress value
            const progressBar = document.getElementById('progressBar')
            if (progressBar) {
              setProgressValue(self.progress * 100)
              // @ts-expect-error HTMLelement
              progressBar.value = self.progress * 100
            }
          },
        },
      })
    }, component)

    return () => ctx.revert()
  }, [])

  return (
    <section className={progressValue > 0 ? `stickySection ${style.bannerContainer}` : style.bannerContainer}>
      <div className={style.bannerTop}>
        <HeadingComponent headingLevel={2} title={content.EngageCustomers.title} colorVariant={'black'} />
        <ParagraphComponent text={content.EngageCustomers.caption} sizeVariant={'medium'} colorVariant={'black'} />
        <div className={style.bannerBottons}>
          <progress id="progressBar" max="100" value="0"></progress>
          <span>Interaction</span>
          <span className={progressValue >= 50 ? style.activeButton : ''}>Engagement</span>
          <span className={progressValue >= 90 ? style.activeButton : ''}>Automation</span>
        </div>
      </div>
      <div ref={component} style={{ overflow: 'hidden' }}>
        <div ref={slider} className={style.panelContainer}>
          <div className={`panel ${style.panel}`}>
            <div className={style.imgContainer}>
              <Image priority loading="eager" src={interaction1} alt="genuine" />
              <Image priority loading="eager" src={interaction2} alt="genuine" />
              <Image priority loading="eager" src={interaction3} alt="genuine" />
            </div>
          </div>
          <div className={`panel ${style.panel}`}>
            <div className={style.imgContainer}>
              <Image priority loading="eager" src={Engagement1} alt="genuine" />
              <Image priority loading="eager" src={Engagement2} alt="genuine" />
            </div>
          </div>
          <div className={`panel ${style.panel}`}>
            <div className={style.imgContainer}>
              <Image priority loading="eager" src={Automation1} alt="genuine" />
              <Image priority loading="eager" src={Automation2} alt="genuine" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EngageCustomers
