'use client'

import { useEffect } from 'react'

export function EmbedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // console.log('Hello world....`')
  }, [])
  return <>{children}</>
}
