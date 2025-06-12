'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * Enhanced React Query Provider with Next.js 15 optimizations
 * - Uses staleTime aligned with Next.js 15 staleTimes configuration
 * - Configures proper caching strategy for router compatibility
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Match staleTime with Next.js 15 staleTimes config
            staleTime: 30 * 1000, // 30 seconds for dynamic data
            // Optimize refetching strategy
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            refetchOnReconnect: 'always',
          },
          mutations: {
            // Optimize mutation settings for server actions
            networkMode: 'always',
            // Retry failed mutations with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
