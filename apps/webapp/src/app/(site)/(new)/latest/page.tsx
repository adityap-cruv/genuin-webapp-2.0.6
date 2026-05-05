import { type Metadata } from 'next'

import { Root } from './root'

// type Props = {
//   searchParams: {
//     brand_id?: string
//   }
// }

export default function Page() {
  return <Root />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Latest | Welcome to Genuin!',
  }
}
