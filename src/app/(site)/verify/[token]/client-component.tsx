'use client'
import { useEffect } from 'react'

export function ClientComponentSMS({ redirectTo }: { redirectTo: string }) {
  useEffect(() => {
    window.location.replace(redirectTo)
  }, [])
  return <></>
}
