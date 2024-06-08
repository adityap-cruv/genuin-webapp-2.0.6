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
}

export function RootHTML({ brandColors, favicon, subdomain, children, className, noIndex = false, ...props }: Props) {
  return (
    <html lang="en" style={{ ...brandColors }}>
      <head>
        <link rel="icon" type="image/x-icon" href={favicon ?? '/favicon.svg'} />
        <link rel="mask-icon" href={favicon ?? '/favicon.svg'} />
        <meta rel="x-brand-id" content={subdomain} />
        {noIndex && <meta name="robots" content="noindex" />}
      </head>
      <body
        className={cn('index-page-background !absolute inset-0 min-h-full min-w-full text-secondary', className)}
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
