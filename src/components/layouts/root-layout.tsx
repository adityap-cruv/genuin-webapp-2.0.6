import { type ReactNode } from 'react'

export function RootHTML({
  brandColors,
  favicon,
  subdomain,
  children,
}: {
  brandColors?: any
  favicon?: string
  subdomain?: string
  children: ReactNode
}) {
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
      </head>
      <body className="index-page-background !absolute inset-0 min-h-full min-w-full text-secondary">{children}</body>
    </html>
  )
}
