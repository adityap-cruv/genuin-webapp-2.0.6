import { type Metadata } from 'next'
import './globals.css'
import { ReactQueryProvider } from '@components/providers/query-client-provider'
import { EmbedProvider } from '@components/providers/embed-provider'
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.svg" />
        <link rel="mask-icon" href="/favicon.svg" />
        <Script id="bufferEvents">
          {`
            window.rudderanalytics = [];
            var methods = [
              'load',
              'page',
              'track',
              'identify',
              'alias',
              'group',
              'ready',
              'reset',
              'getAnonymousId',
              'setAnonymousId',
              'getUserId',
              'getUserTraits',
              'getGroupId',
              'getGroupTraits',
              'startSession',
              'endSession',
              'getSessionId',
            ];
            for (var i = 0; i < methods.length; i++) {
              var method = methods[i];
              window.rudderanalytics[method] = (function (methodName) {
                return function () {
                  window.rudderanalytics.push([methodName].concat(Array.prototype.slice.call(arguments)));
                };
              })(method);
            }
        `}
        </Script>
      </head>
      <body className="index-page-background absolute inset-0 min-h-full min-w-full text-new-off-black">
        <ReactQueryProvider>
          <EmbedProvider>{children}</EmbedProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://media.begenuin.com'),
  }
}
