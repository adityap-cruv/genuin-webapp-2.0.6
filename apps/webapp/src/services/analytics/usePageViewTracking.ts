// src/services/analytics/usePageViewTracking.ts
'use client'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Analytics from './index'

export function usePageViewTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = searchParams?.size ? `${pathname}?${searchParams.toString()}` : pathname
    if (url) {
      Analytics.pageview()
    }
  }, [pathname, searchParams])
}
