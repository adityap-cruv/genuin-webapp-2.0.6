import { type Metadata } from 'next'
import MainComponent from './main-component'

export default function Component() {
  return <MainComponent />
}

export function generateMetadata(): Metadata {
  return {
    robots: { index: false, follow: false },
  }
}
