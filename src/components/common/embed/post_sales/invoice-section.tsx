import React from 'react'
import { type InvoiceSectionType } from '../../../../../types/embed/embed-post-sales'
import MultiEmbed from '../multi-embed'
import { EmbedConfigsType } from '@/hooks/use-embed-details'

const InvoiceSection = ({
  invoiceSection,
  embedConfigs,
}: {
  invoiceSection: InvoiceSectionType
  embedConfigs: EmbedConfigsType
}) => {
  return (
    <>
      <section className="hidden py-10 md:block">
        <div className="flex w-full items-center gap-10">
          <div className="flex w-3/4 flex-col gap-10">
            <div className="opacity-40">
              <p className="mb-4 text-title-1-bold">{invoiceSection?.subTitle}</p>
              <p className="text-new-h2">{invoiceSection?.title}</p>
            </div>
            <MultiEmbed
              dataEmbedId={`${embedConfigs['Post-Sales Embed'].embedId}`}
              genSdkId={1}
              style={{
                height: '400px',
              }}
            />
          </div>

          <div className="h-full w-1/4 opacity-40">
            <div className="flex h-full flex-col gap-40 rounded-xl bg-monochrome-white px-4 py-6 shadow-md">
              <div className="flex flex-col gap-6">
                <p className="text-title-1-bold">{invoiceSection?.order.title}</p>
                {invoiceSection?.order.items.map((item, index) => (
                  <div key={index}>
                    <p className="text-title-3-bold">{item[0]}</p>
                    <p className="text-body-1-med">{item[1]}</p>
                    <p className="text-body-1-med">{item[2]}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-title-1-bold">
                <p>Subtotal</p>
                <p>{invoiceSection?.subtotal}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10 md:hidden">
        <div className="flex w-full items-center gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex h-full flex-col gap-28 rounded-xl bg-monochrome-white px-4 py-6 opacity-40 shadow-2xl">
              <div className="flex flex-col gap-6">
                <p className="text-title-2-demi font-medium">{invoiceSection?.order.title}</p>
                {invoiceSection?.order.items.map((item, index) => (
                  <div key={index}>
                    <p className="text-title-3-bold">{item[0]}</p>
                    <p className="text-body-1-med">{item[1]}</p>
                    <p className="text-body-1-med">{item[2]}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-title-2-demi font-medium">
                <p>Subtotal</p>
                <p>{invoiceSection?.subtotal}</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="opacity-40">
                <p className="mb-2 text-title-2-bold">{invoiceSection?.subTitle}</p>
                <p className="text-new-h3-mobile">{invoiceSection?.title}</p>
              </div>
              <MultiEmbed
                dataEmbedId={`${embedConfigs['Post-Sales Embed'].embedId}`}
                genSdkId={1}
                style={{
                  height: '400px',
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default InvoiceSection
