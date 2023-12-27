import { Root } from './root'
import { type Metadata } from 'next'

type Props = {
  searchParams: {
    brand_id?: string
  }
}

export default function Page({ searchParams }: Props) {
  return <Root brandId={searchParams.brand_id} />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Latest | Welcome to Genuin!',
  }
}
