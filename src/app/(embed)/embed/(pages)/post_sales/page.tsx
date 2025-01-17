import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import CommunitiesSection from '@/components/common/embed/home/communities-section'
import InvoiceSection from '@/components/common/embed/post_sales/invoice-section'
import OrderDetailsSection from '@/components/common/embed/post_sales/order-details-section'
import { EmbedPostSales } from '@/content/embed/embed-post-sales'

export default async function Page() {
  const postSalesData = EmbedPostSales.find((item) => item.food)?.food

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
