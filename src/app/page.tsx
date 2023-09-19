'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function Home() {
  const { data: session } = useSession({
    required: false,
    onUnauthenticated: () => {
      console.log('not authenticated...')
    },
  })
  console.log('se::', session)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-9xl">
      <h2 className="text-cap-sm">index page..</h2>
      <Link href="/terms" className="text-">
        Go to terms
      </Link>
    </main>
  )
}
