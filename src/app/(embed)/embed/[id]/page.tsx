import { SizeProvider } from './size-provider'
import { StandardView } from './standard-view'
import { VerticalView } from './vertical-view'
import { CarouselView } from './carousel-view'
import 'swiper/css'
import { getEmbedDetails } from '@lib/api/embed'

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
  console.log(embedDetails)
  // const embedPage = props.searchParams.embed_page
  const embedPage = embedDetails.data.style

  let viewComponent

  if (embedPage === 'carousel') {
    viewComponent = <CarouselView />
  } else if (embedPage === 'standard_wall') {
    viewComponent = <StandardView />
  } else if (embedPage === 'vertical') {
    viewComponent = <VerticalView />
  } else {
    // Default view if embed_page doesn't match any condition
    viewComponent = <StandardView />
  }

  return <SizeProvider>{viewComponent}</SizeProvider>
}
