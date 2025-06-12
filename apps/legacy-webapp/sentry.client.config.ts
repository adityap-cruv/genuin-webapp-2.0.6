/**
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 *
 * Updated for compatibility with Next.js 15 and React 19
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Next.js 15 specific configuration
  // Adjust this for production to avoid excessive telemetry
  enableTracing: process.env.NODE_ENV === 'production',

  // Filter out unwanted transactions
  beforeSendTransaction(event) {
    // Ignore middleware transactions to reduce noise
    if (event.transaction && event.transaction.startsWith('middleware')) {
      return null
    }
    // Ignore internal Next.js transactions for better signal-to-noise ratio
    if (event.transaction && event.transaction.includes('/_next/')) {
      return null
    }
    return event
  },
})
