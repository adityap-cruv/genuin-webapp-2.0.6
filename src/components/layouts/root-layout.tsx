import { cn } from '@lib/utils'
import { type ComponentProps, type ReactNode } from 'react'

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
        <meta
          name="viewport"
          content="height=device-height,width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        {noIndex && <meta name="robots" content="noindex" />}
      </head>
      <body
        className={cn('index-page-background !absolute inset-0 min-h-full min-w-full text-secondary', className)}
        {...props}>
        {children}
      </body>
    </html>
  )
}
