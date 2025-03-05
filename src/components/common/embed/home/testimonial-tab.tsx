import React from 'react'
import t1 from '@images/embed/testimonial-user.svg'
import Image from 'next/image'
import { TestimonialStarIcon } from '@images/embed/social-icons/testimonial-star-icon'

const TestimonialTab = () => {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Image src={t1} alt="imgPuppet" />
        <div>
          <p className="text-title-2-demi font-medium">Theresa Jordan</p>
          <p className="text-cap-1-med text-tertiary">Food Enthusiast</p>
        </div>
      </div>
      <div className="mt-2 flex items-end gap-2">
        <TestimonialStarIcon variant={'filled'} />
        <TestimonialStarIcon variant={'filled'} />
        <TestimonialStarIcon variant={'filled'} />
        <TestimonialStarIcon variant={'filled'} />
        <TestimonialStarIcon variant={'outlined'} />
        <span>4.8</span>
      </div>
    </div>
  )
}

export default TestimonialTab
