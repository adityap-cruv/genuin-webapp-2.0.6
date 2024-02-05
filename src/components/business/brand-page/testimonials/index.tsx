import React from 'react'
import style from './testimonials.module.scss'
import content from '../../../../content/brands-page.json'
import HeadingComponent from '../../heading'
import ParagraphComponent from '../../paragraph'

export default function Testimonial() {
  return (
    <section className={style.container}>
      {/* Testimonials Section Heading */}
      <HeadingComponent headingLevel={2} title={'What Users Say About Genuin'} colorVariant={'black'} />

      <div className={style.row}>
        {/* Map through Testimonials data from the content object */}
        {content?.Testimonials.map(({ text, name, position, img }, index) => (
          <div className={style.card} key={index}>
            {/* Testimonial Body */}
            <div className={style.cardBody}>
              <HeadingComponent headingLevel={5} title={text} colorVariant={'black'} />
            </div>

            {/* Testimonial Footer */}
            <div className={style.cardFooter}>
              {/* Testimonial Image */}
              <img
                loading="lazy"
                fetchPriority="low"
                decoding="async"
                src={img}
                alt={name}
                className={style.testimonialImg}
                width={128}
                height={128}
              />
              {/* Testimonial Details */}
              <div className={style.testimonialDetails}>
                {/* Testimonial Name */}
                <HeadingComponent headingLevel={5} title={name} colorVariant={'black'} />

                {/* Testimonial Position */}
                <ParagraphComponent text={position} sizeVariant={'medium'} colorVariant={'black'} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
