import { cn } from '@lib/utils'
import { type Viewport } from 'next'
import { type ComponentProps, type ReactNode } from 'react'
import { RedirectToHTTPS } from './redirect-to-https'

type Props = ComponentProps<'body'> & {
  brandColors?: any
  favicon?: string
  subdomain?: string
  children: ReactNode
  noIndex?: boolean
  isIheartDemo?: boolean
}

export function RootHTML({
  brandColors,
  favicon,
  subdomain,
  children,
  className,
  noIndex = false,
  style,
  isIheartDemo = false,
  ...props
}: Props) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href={favicon ?? '/favicon.svg'} />
        <link rel="mask-icon" href={favicon ?? '/favicon.svg'} />
        <meta rel="x-brand-id" content={subdomain} />
        {/* TODO PUT PROD BUILD */}
        {/* <script src="/gen_sdk.js" /> */}
        {noIndex && <meta name="robots" content="noindex" />}
      </head>
      <body
        style={{
          ...brandColors,
          ...style,
          ...(isIheartDemo ? { fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" } : {}),
        }}
        className={cn('h-full w-full text-secondary md:h-screen', className)}
        {...props}>
        {children}
        <RedirectToHTTPS />
      </body>
    </html>
  )
}

export function getViewport(): Viewport {
  return {
    height: 'device-height',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  }
}
