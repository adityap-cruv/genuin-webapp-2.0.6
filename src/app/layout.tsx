import { type Metadata } from 'next'
import './globals.css'
import { ReactQueryProvider } from '@components/providers/query-client-provider'
import { cookies } from 'next/headers'
import { GenuinOptionsProvider } from '@components/providers/genuin-options-provider'
import { ThirdPartyScriptProvider } from '@components/providers/third-party-script-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" />
      </head>
      <body className="index-page-background absolute inset-0 min-h-full min-w-full text-new-off-black">
        <ThirdPartyScriptProvider>
          <GenuinOptionsProvider isMobile={isMobile}>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </GenuinOptionsProvider>
        </ThirdPartyScriptProvider>
      </body>
    </html>
  )
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}
