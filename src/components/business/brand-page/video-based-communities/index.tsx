import React from 'react' // Import React for creating React components
import Image from 'next/image' // Import the Image component from Next.js for handling images
import style from './communities.module.scss' // Import SCSS styles for the header
import HeadingComponent from '../../heading' // Import typography component for section title
import ParagraphComponent from '../../paragraph' // Import typography component for paragraphs
import Engagement2 from '@images/customer-engage/engagement-2.png'

export default function VideoBasedCommunities() {
  return (
    <section className={style.container}>
      <HeadingComponent headingLevel={2} title={'Why build short video based Communities?'} colorVariant={'black'} />
    </section>
  )
}
