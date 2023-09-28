'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <div onClick={reset}>{error.message}</div>
}
