import React from 'react'
import { type InvoiceSectionType } from '../../../../../types/embed/embed-post-sales'
import MultiEmbed from '../multi-embed'
import { type EmbedConfigsType } from '@/hooks/use-embed-details'

const InvoiceSection = ({
  invoiceSection,
  embedConfigs,
}: {
  invoiceSection: InvoiceSectionType
  embedConfigs: EmbedConfigsType
}) => {
  return (
    <section className="py-10">
      <div className="flex w-full flex-col-reverse md:flex-row md:items-start md:gap-10">
        {/* Content and Embed Section */}
        <div className="flex w-full flex-col gap-6 md:w-3/4">
          <div>
            <p className="mb-2 text-title-2-bold md:mb-4 md:text-title-1-bold">{invoiceSection?.subTitle}</p>
            <p className="text-new-h3-mobile md:text-new-h2">{invoiceSection?.title}</p>
          </div>

          <div className="rounded-xl">
            <MultiEmbed
              dataEmbedId={embedConfigs['Post-Sales Embed'].embedId}
              dataEmbedApiKey={embedConfigs['Post-Sales Embed'].embedApiKey}
              style={{
                height: '400px',
                width: '100%',
                padding: '8px',
              }}
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-6 flex w-full flex-col gap-52 rounded-xl bg-monochrome-white px-4 py-6 shadow-md md:mb-0 md:w-1/4">
          <div className="flex flex-col gap-6">
            <p className="text-title-2-demi font-medium md:text-title-1-bold">{invoiceSection?.order.title}</p>

            {invoiceSection?.order.items.map((item, index) => (
              <div key={index}>
                <p className="text-title-3-bold">{item[0]}</p>
                <p className="text-body-1-med">{item[1]}</p>
                <p className="text-body-1-med">{item[2]}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto flex justify-between text-title-2-demi font-medium md:text-title-1-bold">
            <p>Subtotal</p>
            <p>{invoiceSection?.subtotal}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InvoiceSection
