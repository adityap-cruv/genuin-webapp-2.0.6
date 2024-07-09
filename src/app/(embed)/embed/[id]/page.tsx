import { StandardView } from './standard-view'
import { getEmbedDetails } from '@/components/embed/api'
import { VerticalView } from './vertical-view'
import { CarouselView } from './carousel-view'
import 'swiper/css'

type Props = {
  params: {
    id: string
  }
  searchParams: {
    hide_navbar: '0' | '1'
    embed_page: string
    api_key: string
    brand_id: string
    subdomain: string
    embed: '0' | '1'
  }
}

export default async function Page(props: Props) {
  const embedDetails = await getEmbedDetails(props.params.id)

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
}
