'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import CommunitiesSection from '@/components/common/embed/home/communities-section'
import InvoiceSection from '@/components/common/embed/post_sales/invoice-section'
import OrderDetailsSection from '@/components/common/embed/post_sales/order-details-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedPostSales } from '@/content/embed/embed-post-sales'
import { useEmbedSetup } from '@/hooks/use-embed-details'
import { getIndustryName } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

type IndustryName = keyof (typeof EmbedPostSales)[number]

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type) as IndustryName
  const postSalesData = EmbedPostSales.find((item) => Object.keys(item).includes(industryName))?.[industryName]
  const { embedConfigs } = useEmbedSetup({ config })

  return (
    <div className="w-full overflow-scroll px-5">
      <EmbedNav />
      <OrderDetailsSection orderDetailsSection={postSalesData?.orderDetailsSection} />
      <InvoiceSection invoiceSection={postSalesData?.invoiceSection} embedConfigs={embedConfigs} />
      <CommunitiesSection communitiesSection={postSalesData?.communitiesSection} embedConfigs={embedConfigs} />
      <EmbedFooter />
    </div>
  )
}
