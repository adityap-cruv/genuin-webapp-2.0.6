'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// Create a global queryClient for use outside the React component tree
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
})

// For React 19 and TanStack Query 5, create a client per-request
export const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  // Use the global queryClient instead of creating a new one per component
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
