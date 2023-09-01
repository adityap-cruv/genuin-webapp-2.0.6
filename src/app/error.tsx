'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.log('reset:', reset)
  return <div>Error happened in index js.</div>
}
