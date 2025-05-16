/**
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 *
 * Updated for compatibility with Next.js 15
 */

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  // Using a lower sampling rate for server to reduce costs
  tracesSampleRate: 0.3,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Next.js 15 specific configuration
  // Only enable performance tracing in production
  enableTracing: process.env.NODE_ENV === 'production',

  // Filter out unwanted transactions
  beforeSendTransaction(event) {
    // Ignore middleware transactions to reduce noise
    if (event.transaction && event.transaction.startsWith('middleware')) {
      return null
    }
    // Ignore health checks and _next internal requests
    if (event.transaction && (event.transaction.includes('/api/health') || event.transaction.includes('/_next/'))) {
      return null
    }
    return event
  },
})
