'use client'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import CommunitiesSection from '@/components/common/embed/home/communities-section'
import InvoiceSection from '@/components/common/embed/post_sales/invoice-section'
import OrderDetailsSection from '@/components/common/embed/post_sales/order-details-section'
import { useEmbedConfig } from '@/components/embed/embed-config-provider'
import { EmbedPostSales } from '@/content/embed/embed-post-sales'
import { getIndustryName } from '@/lib/utils'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

declare global {
  interface Window {
    genuin: {
      init: (config: object) => void
    }
  }
}

export default function Page() {
  const { config } = useEmbedConfig(
    useShallow((state) => ({
      config: state.config,
    }))
  )
  const industryName = getIndustryName(config?.industry_type)
  const postSalesData = (EmbedPostSales.find((item: any) => item[industryName]) as any)?.[industryName]

  useEffect(() => {
    window.genuin.init({})
    document.body.style.backgroundColor = '#FAFAFA'

    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <OrderDetailsSection orderDetailsSection={postSalesData?.orderDetailsSection} />
      <InvoiceSection invoiceSection={postSalesData?.invoiceSection} />
      <CommunitiesSection communitiesSection={postSalesData?.communitiesSection} />
      <EmbedFooter />
    </div>
  )
}
