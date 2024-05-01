import { Root } from './root'
import { type Metadata } from 'next'

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
    title: 'Home | Welcome to Genuin!',
  }
}
