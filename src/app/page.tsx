const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function Home() {
  await wait(5000)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <h2 className="text-primary-text flex">index page..</h2>
    </main>
  )
}
