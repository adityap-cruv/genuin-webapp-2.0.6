import { TestimonialStarIcon } from '@images/embed/social-icons/testimonial-star-icon'
import { ChevronDown } from 'lucide-react'
import { type PDPSection } from '../../../../../types/embed/embed-pdp'

const PdpSection = ({ pdpSection }: { pdpSection: PDPSection }) => {
  return (
    <>
      <section className="hidden py-11 opacity-40 md:block">
        <div className="flex w-full items-center gap-10">
          <div className="w-1/2">
            <img src={pdpSection?.image} alt="pdp-image" />
          </div>
          <div className="flex w-1/2 flex-col gap-4">
            <div className="mt-2 flex items-end gap-2">
              <TestimonialStarIcon type="filled" />
              <TestimonialStarIcon type="filled" />
              <TestimonialStarIcon type="filled" />
              <TestimonialStarIcon type="filled" />
              <TestimonialStarIcon />
              <span>11 Reviews</span>
            </div>

            <p className="text-new-h1">{pdpSection?.title}</p>

            <p className="text-title-3-med">{pdpSection?.caption}</p>

            <p className="text-title-1-bold">{pdpSection?.price}</p>

            <div className="flex w-36 items-center justify-between rounded-full bg-primary-100 p-1.5 px-2 text-[28px]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-monochrome-white">
                −
              </div>
              <p>1</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-monochrome-white">
                +
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {pdpSection?.category.map((item, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-lg border border-primary p-2 text-title-3-bold">
                  <div className="flex justify-between">
                    <p className="text-primary">{item.label}</p>
                    {index === 0 && <ChevronDown className="h-5 stroke-primary" />}
                  </div>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center rounded-full border p-2.5 text-title-3-demi">
              {pdpSection?.button[0].text}
            </div>
            <div className="flex justify-center rounded-full border border-primary bg-primary p-2.5 text-title-3-demi text-monochrome-white">
              {pdpSection?.button[1].text}
            </div>
          </div>
        </div>
      </section>

      <section className="py-11 opacity-40 md:hidden">
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <img src={pdpSection?.image} alt="pdp-image" />

          <div className="flex flex-col gap-4">
            <div className="mt-2 flex items-end">
              <TestimonialStarIcon type="filled" className="h-4" />
              <TestimonialStarIcon type="filled" className="h-4" />
              <TestimonialStarIcon type="filled" className="h-4" />
              <TestimonialStarIcon type="filled" className="h-4" />
              <TestimonialStarIcon className="h-4" />
              <span className="text-cap-2-demi">11 Reviews</span>
            </div>

            <p className="text-title-1-bold">{pdpSection?.title}</p>

            <p className="text-title-3-med">{pdpSection?.caption}</p>

            <p className="text-title-3-bold">{pdpSection?.price}</p>

            <div className="flex w-36 items-center justify-between rounded-full bg-primary-100 p-1.5 px-2 text-[20px]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-monochrome-white">
                −
              </div>
              <p>1</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-monochrome-white">
                +
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {pdpSection?.category.map((item, index) => (
                <div className="flex flex-col gap-2 rounded-lg border border-primary p-2 text-body-1-bold" key={index}>
                  <div className="flex justify-between">
                    <p className="text-primary">{item.label}</p>
                    <ChevronDown className="h-5 stroke-primary" />
                  </div>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center rounded-full border p-2.5 text-title-3-demi">
              {pdpSection?.button[0].text}
            </div>
            <div className="flex justify-center rounded-full border border-primary bg-primary p-2.5 text-title-3-demi text-monochrome-white">
              {pdpSection?.button[1].text}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default PdpSection
