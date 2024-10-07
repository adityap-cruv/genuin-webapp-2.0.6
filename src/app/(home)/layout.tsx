import { type Metadata } from 'next'
import '../globals.css'
import { getViewport, RootHTML } from '@components/layouts/root-layout'
import { HubSpotProvider } from '@/components/providers/hubspot-provider'
import { Manrope } from 'next/font/google'
// import { cn } from '@/lib/utils'

const fonts = Manrope({ subsets: ['cyrillic'] })

// TODO: add platform discovery to the route and create different route for all.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootHTML className={fonts.className}>
      {/* Added hubspot Provider for Tracking */}
      <HubSpotProvider />
      {children}
    </RootHTML>
  )
}

// export default async function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         {/* <link rel="icon" type="image/x-icon" href={favicon ?? '/favicon.svg'} /> */}
//         {/* <link rel="mask-icon" href={favicon ?? '/favicon.svg'} /> */}
//         {/* <meta rel="x-brand-id" content={subdomain} /> */}
//         {/* {noIndex && <meta name="robots" content="noindex" />} */}
//       </head>
//       <body className={cn('!absolute inset-0 min-h-full min-w-full text-secondary', fonts.className)}>
//         {children}
//         {/* <RedirectToHTTPS /> */}
//         {/* <LogRockerInitializer /> */}
//       </body>
//     </html>
//   )
// }

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}

export const viewport = getViewport()
