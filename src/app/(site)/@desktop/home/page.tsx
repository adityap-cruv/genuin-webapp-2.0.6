import { auth } from '../../../../../auth'
import { Root } from './root'
import { type Metadata } from 'next'

// type Props = {
//   searchParams: {
//     brand_id?: string
//   }
// }

export default async function Page() {
  const data = await auth()
  console.log(data)
  return <Root />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Home | Welcome to Genuin!',
  }
}
