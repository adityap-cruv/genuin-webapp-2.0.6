'use client'
import { useEffect } from 'react'
import { CarouselView } from '../../../../components/embed/views/carousel-view'
import { useEmbedPlayerState } from '@/components/embed/embed-player-state'

export default function Page() {
  const { setEmbedType } = useEmbedPlayerState()
  useEffect(() => {
    setEmbedType('carousel')
  }, [])

  return <CarouselView />
}
