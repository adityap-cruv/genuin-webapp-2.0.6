import { Root } from './root'

type Props = {
  searchParams: {
    brand_id?: string
  }
}

export default function Page({ searchParams }: Props) {
  return <Root brandId={searchParams.brand_id} />
}
