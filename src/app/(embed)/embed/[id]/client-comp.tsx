'use client'

import { useEffect } from 'react'

export function ClientComp() {
  useEffect(() => {
    const objToSent = { embed_id: '2353', view: '233', startingVideo: '2343' }
    setInterval(() => {
      window.parent.postMessage(JSON.stringify(objToSent), '*')
    }, 2000)
  }, [])
  return <div>this is client side.</div>
}
