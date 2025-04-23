'use client'
import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/scss'
import Image from 'next/image'
import style from './engage.module.scss'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'
import content from '../../../../content/brands-page.json'
import interaction1 from '@images/business/brand-page/customer-engage/interaction-1.png'
import interaction2 from '@images/business/brand-page/customer-engage/interaction-2.png'
import interaction3 from '@images/business/brand-page/customer-engage/interaction-3.png'
import Engagement1 from '@images/business/brand-page/customer-engage/engagement-1.png'
import Engagement2 from '@images/business/brand-page/customer-engage/engagement-2.png'
import Automation1 from '@images/business/brand-page/customer-engage/automation-1.png'
import Automation2 from '@images/business/brand-page/customer-engage/automation-2.png'

const EngageCustomers: React.FC = () => {
  // Define the steps for the swiper bullets
  const steps = ['Interaction', 'Engagement', 'Automation']

  // State to track the active index of the swiper
  const [activeIndex, setActiveIndex] = useState<number>(0)

  // Swiper configuration parameters
  const params = {
    modules: [Pagination],
    spaceBetween: 50,
    slidesPerView: 1,
    speed: 1200,
    pagination: {
      clickable: true,
      renderBullet: function (index: number, className: string) {
        // Use className to style the bullets and indicate the active index
        return `<div class="${className} active-${index}">${steps[index]}</div>`
      },
    },
  }

  return (
    <section className={style.container}>
      {/* Section heading */}
      <HeadingComponent headingLevel={2} title={content.EngageCustomers.title} colorVariant={'black'} />

      {/* Section paragraph */}
      <ParagraphComponent text={content.EngageCustomers.caption} sizeVariant={'medium'} colorVariant={'black'} />

      {/* Swiper container with dynamic class based on the activeIndex */}
      <div className={`swiper-container slide-${activeIndex}`}>
        {/* Swiper component with slides */}
        <Swiper
          {...params}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper?.activeIndex)
          }}>
          {/* Slide 1 */}
          <SwiperSlide className="one">
            <Image priority loading="eager" src={interaction1} alt="genuin" />
            <Image priority loading="eager" src={interaction2} alt="genuin" />
            <Image priority loading="eager" src={interaction3} alt="genuin" />
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide className="two">
            <Image priority loading="eager" src={Engagement1} alt="genuin" />
            <Image priority loading="eager" src={Engagement2} alt="genuin" />
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide className="three">
            <Image priority loading="eager" src={Automation1} alt="genuin" />
            <Image priority loading="eager" src={Automation2} alt="genuin" />
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  )
}

export default EngageCustomers
