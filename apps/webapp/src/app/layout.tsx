import { Inter } from 'next/font/google'
import './globals.css'
import { Metadata, Viewport } from 'next'

// Root layout is now split into server and client parts for Next.js 15
// Client components are wrapped in ClientProviders
import ClientProviders from './client-providers'

const inter = Inter({ subsets: ['latin'] })

// Metadata API for Next.js 15
export const metadata: Metadata = {
  title: {
    template: '%s | Genuin',
    default: 'Genuin',
  },
  description: 'A video community platform',
  metadataBase: new URL('https://app.begenuin.com'),
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
