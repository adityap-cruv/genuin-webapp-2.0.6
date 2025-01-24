import videoFrame from '@images/embed/video-frame.png'
import Image from 'next/image'
import TestimonialTab from './testimonial-tab'
import { type TestimonialSectionType } from '../../../../../types/embed/embed-home'

const TestimonialSection = ({ testimonialSection }: { testimonialSection: TestimonialSectionType }) => {
  if (!testimonialSection) return null
  return (
    <>
      {/* Desktop */}
      <section className="hidden py-20 md:block">
        <div className="flex w-full items-center gap-6">
          <div className="w-2/5">
            <Image src={videoFrame} alt="imgPuppet" />
          </div>
          <div className="flex w-3/5 flex-col gap-3 opacity-40">
            <p className="text-title-2-bold text-primary">{testimonialSection.sectionTitle}</p>
            <p className="text-title-1-bold-home-m">{testimonialSection.title}</p>
            <p className="text-title-2-demi font-medium">{testimonialSection.caption}</p>
            <div className="mt-6">
              <TestimonialTab />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-10 md:hidden">
        <div className="flex flex-col items-center gap-3">
          <Image src={videoFrame} alt="imgPuppet" className="pb-10" />
          <p className="text-cap-1-bold-home text-primary opacity-40">{testimonialSection.sectionTitle}</p>
          <p className="text-center text-new-h2-mobile opacity-40">{testimonialSection.title}</p>
          <p className="text-center text-title-2-demi font-medium opacity-40">{testimonialSection.caption}</p>
          <div className="mt-6 opacity-40">
            <TestimonialTab />
          </div>
        </div>
      </section>
    </>
  )
}

export default TestimonialSection
