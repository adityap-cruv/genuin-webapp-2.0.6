import { StandardView } from '@/components/embed/views/standard-view'
import { getEmbedDetails } from '@/components/embed/api'
import { VerticalView } from '@/components/embed/views/vertical-view'
import { CarouselView } from '@/components/embed/views/carousel-view'
import 'swiper/css'

type Props = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    hide_navbar: '0' | '1'
    embed_page: string
    api_key: string
    brand_id: string
    subdomain: string
    embed: '0' | '1'
  }>
}

export default async function Page(props: Props) {
  try {
    const embedDetails = await getEmbedDetails((await props.params).id)
    const embedPage = embedDetails.data.style

    let viewComponent

    if (embedPage === 'carousel') {
      viewComponent = <CarouselView />
    } else if (embedPage === 'standard_wall') {
      viewComponent = <StandardView />
    } else if (embedPage === 'feed') {
      viewComponent = <VerticalView />
    } else {
      // Default view if embed_page doesn't match any condition
      viewComponent = <StandardView />
    }

    return viewComponent
  } catch (e) {
    return <div>Something went wrong.</div>
  }
}
