import { type Metadata } from 'next'
import '../globals.css'
import { RootHTML, getViewport } from '@components/layouts/root-layout'

// TODO: add platform discovery to the route and create different route for all.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHTML>{children}</RootHTML>
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}

export const viewport = getViewport()
