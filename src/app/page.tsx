import Link from 'next/link'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function Home() {
  await wait(500)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-9xl">
      <h2 className="text-cap-sm">index page..</h2>
      <Link href="/terms" className="text-">
        Go to terms
      </Link>
    </main>
  )
}
