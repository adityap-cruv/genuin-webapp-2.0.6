import React from 'react' // Import React for creating React components
import style from './communities.module.scss' // Import SCSS styles for the header
import HeadingComponent from '../../heading' // Import typography component for section title
import dashboard from '@images/business/brand-page/video-base-communities/dashboard.webp'

export default function VideoBasedCommunities() {
  return (
    <section className={style.container}>
      <HeadingComponent headingLevel={2} title={'Collect and Manage New First Party Data'} colorVariant={'black'} />
      <p className="text-new-para-1 my-4">
        Gain insights and access your community participants directly, integrate with existing identity and data clean
        rooms
      </p>
      <div className="mt-12 flex justify-center">
        <img
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          src={dashboard.src}
          alt="genuin"
          className={style.testimonialImg}
        />
      </div>
    </section>
  )
}
