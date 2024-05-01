import { type Metadata } from 'next'
import '../globals.css'
import { RootHTML } from '@components/layouts/root-layout'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHTML>{children}</RootHTML>
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}
