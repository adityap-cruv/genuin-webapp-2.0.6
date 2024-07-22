'use client'
import { VerticalView } from '../[id]/vertical-view'
import { useEffect } from 'react'
import { useEmbedPlayerState } from '@/components/embed/embed-player-state'

export default function Page() {
  const { setEmbedType } = useEmbedPlayerState()
  useEffect(() => {
    setEmbedType('carousel')
  }, [])

  return <VerticalView />
}
