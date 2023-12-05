import { type Metadata } from 'next'
import './globals.css'
import { ReactQueryProvider } from '@components/providers/reactQueryProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
      </head>
      <body className="index-page-background absolute inset-0 min-h-full min-w-full">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  )
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}
