import { Root } from './root'
import { type Metadata } from 'next'

export default async function Page() {
  return <Root />
}

export function generateMetadata(): Metadata {
  return {
    title: 'Home | Welcome to Genuin!',
  }
}
