import { SizeProvider } from './size-provider'
import { StandardView } from './standard-view'
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

export default function Page(props: Props) {
  return (
    <SizeProvider>
      <CarouselView />
    </SizeProvider>
  )
}
