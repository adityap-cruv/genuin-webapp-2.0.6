import { TestimonialStarIcon } from '@images/embed/social-icons/testimonial-star-icon'
import React from 'react'
import { type OrderDetailsSectionType } from '../../../../../types/embed/embed-post-sales'

const OrderDetailsSection = ({ orderDetailsSection }: { orderDetailsSection: OrderDetailsSectionType }) => {
  return (
    <>
      <section className="hidden py-10 opacity-40 md:block">
        <p className="mb-10 text-center text-new-h1">{orderDetailsSection?.indexTitle}</p>
        <div className="flex w-full items-center gap-14 rounded-2xl bg-monochrome-black px-20 py-6 text-monochrome-white">
          <div className="w-2/5">
            <img src={orderDetailsSection?.image} alt="order-image" className="h-auto w-full rounded-xl" />
          </div>
          <div className="flex w-3/5 flex-col gap-3">
            <p className="text-title-1-bold">{orderDetailsSection?.title}</p>
            <div className="flex flex-col">
              {orderDetailsSection?.captions.map((item, index) => (
                <p key={index} className="text-title-3-demi">
                  {item}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-3">
              {orderDetailsSection?.subItems.map((item, index) => (
                <div className="flex flex-col gap-1 text-body-1-demi" key={index}>
                  <p className="flex items-end gap-1">
                    {index === 0 && <TestimonialStarIcon type="filled" className="fill-[#1AC84B]" />}
                    <span>{item.label}</span>
                  </p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 opacity-40 md:hidden">
        <p className="mb-6 text-center text-new-h3-mobile">{orderDetailsSection?.indexTitle}</p>
        <div className="flex w-full items-center gap-14 rounded-2xl bg-monochrome-black p-4 text-monochrome-white">
          <div className="flex flex-col gap-2">
            <img src={orderDetailsSection?.image} alt="order-image" className="mb-2 h-auto w-full rounded-xl" />
            <p className="text-title-1-bold">{orderDetailsSection?.title}</p>
            <div className="flex flex-col">
              {orderDetailsSection?.captions.map((item, index) => (
                <p key={index} className="text-body-1-med">
                  {item}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-3">
              {orderDetailsSection?.subItems.map((item, index) => (
                <div className="flex flex-col gap-1 text-body-1-med" key={index}>
                  <p className="flex items-end gap-1">
                    {index === 0 && <TestimonialStarIcon type="filled" className="fill-[#1AC84B]" />}
                    <span>{item.label}</span>
                  </p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default OrderDetailsSection
