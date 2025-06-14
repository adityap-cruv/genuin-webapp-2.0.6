// src/components/layouts/PageViewTracker.tsx

'use client'

import { usePageViewTracking } from '@/services/analytics'

export function PageViewTracker() {
  usePageViewTracking()
  return null
}
