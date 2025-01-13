import CarouselSection from '@/components/common/embed/carousel-section'
import EmbedFooter from '@/components/common/embed/embed-footer'
import EmbedNav from '@/components/common/embed/embed-nav'
import PdpSection from '@/components/common/embed/pdp/pdp-section'
import { EmbedPdp } from '@/content/embed/embed-pdp'

export default async function Page() {
  const pdpPageData = EmbedPdp.find((item) => item.food)?.food

  return (
    <div className="w-full overflow-scroll px-4 md:px-0">
      <EmbedNav />
      <PdpSection pdpSection={pdpPageData?.pdpSection} />
      <CarouselSection />
      <EmbedFooter />
    </div>
  )
}
