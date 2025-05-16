'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import HeadingComponent from '@components/business/heading'
import ParagraphComponent from '@components/business/paragraph'
import content from '../../../../content/brands-page.json'
import interaction1 from '@images/business/brand-page/customer-engage/interaction-1.webp'
import interaction2 from '@images/business/brand-page/customer-engage/interaction-2.webp'
import interaction3 from '@images/business/brand-page/customer-engage/interaction-3.webp'
import Engagement1 from '@images/business/brand-page/customer-engage/engagement-1.webp'
import Engagement2 from '@images/business/brand-page/customer-engage/engagement-2.webp'
import Automation1 from '@images/business/brand-page/customer-engage/automation-1.webp'
import Automation2 from '@images/business/brand-page/customer-engage/automation-2.webp'
import style from './customer.module.scss'

gsap.registerPlugin(ScrollTrigger)

function EngageCustomers() {
  const [progressValue, setProgressValue] = useState(0)
  const component = useRef<HTMLDivElement>(null)
  const slider = useRef<HTMLDivElement>(null)

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

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section className={progressValue > 0 ? `stickySection ${style.bannerContainer}` : style.bannerContainer}>
      <div className={style.bannerTop}>
        {/* <div className='h-20'></div> */}
        <HeadingComponent headingLevel={2} title={content.EngageCustomers.title} colorVariant={'black'} />
        <ParagraphComponent text={content.EngageCustomers.caption} sizeVariant={'medium'} colorVariant={'black'} />
        <div className={style.bannerBottons}>
          <progress
            id="progressBar"
            max="100"
            value="0"
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: '4px',
              border: 'none',
              background: 'black',
              marginTop: '-2px',
              zIndex: 8,
            }}>
            {' '}
            <style>{`
              ::-webkit-progress-value {
                background: black;
                background-attachment: fixed;
              }
            `}</style>
          </progress>
          <span>Interaction</span>
          <span className={progressValue >= 50 ? style.activeButton : ''}>Engagement</span>
          <span className={progressValue >= 90 ? style.activeButton : ''}>Automation</span>
        </div>
      </div>
      <div ref={component} style={{ overflow: 'hidden' }}>
        <div ref={slider} className={style.panelContainer}>
          <div className={`panel ${style.panel}`}>
            <div className={style.imgContainer} style={{ justifyContent: 'space-between' }}>
              <img fetchPriority="high" loading="eager" className={style.img} src={interaction1.src} alt="genuine" />
              <img fetchPriority="high" loading="eager" className={style.img} src={interaction2.src} alt="genuine" />
              <img fetchPriority="high" loading="eager" className={style.img} src={interaction3.src} alt="genuine" />
            </div>
          </div>
          <div className={`panel ${style.panel}`}>
            <div className={style.imgContainer}>
              <img fetchPriority="high" loading="eager" className={style.img} src={Engagement1.src} alt="genuine" />
              <img fetchPriority="high" loading="eager" className={style.img} src={Engagement2.src} alt="genuine" />
            </div>
          </div>
          <div className={`panel ${style.panel}`}>
            <div className={style.imgContainer}>
              <img fetchPriority="high" loading="eager" className={style.img} src={Automation1.src} alt="genuine" />
              <img fetchPriority="high" loading="eager" className={style.img} src={Automation2.src} alt="genuine" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EngageCustomers
