import { Root } from './root'
import { type Metadata } from 'next'
import { cookies } from 'next/headers'

// type Props = {
//   searchParams: {
//     brand_id?: string
//   }
// }

export default function Page() {
  const host = cookies().get('host_name')?.value ?? ''
  return <Root host={host} />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Home | Welcome to Genuin!',
  }
}
