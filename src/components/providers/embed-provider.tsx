'use client'

import { useEmbedDataStore } from '@lib/stores/embed-data-store'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function EmbedProvider({ children }: { children: React.ReactNode }) {
  const setEmbedOptions = useEmbedDataStore().setData
  const searchParams = useSearchParams()

  useEffect(() => {
    setEmbedOptions({
      brandId: searchParams.get('brand_id') ?? '',
      embed: searchParams.get('embed') === '1',
      logoUrl: searchParams.get('logo_url') ?? '',
      showNavbar: searchParams.get('show_navbar') === '1',
    })
  }, [])

  return <>{children}</>
}
