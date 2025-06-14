'use client'
import { Button } from '@genuin/ui/button'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="mb-4 text-xl font-bold">Something went wrong!</h2>
      <p className="mb-6 text-gray-600">We're sorry for the inconvenience. Please try again.</p>
      <Button onClick={() => reset()} variant="default">
        Try again
      </Button>
    </div>
  )
}
