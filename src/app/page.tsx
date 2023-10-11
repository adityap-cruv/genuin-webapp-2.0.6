import { NavBar } from '@components/common/nav-bar'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'

export default async function Page() {
  const session = await getServerSession()
  return (
    <main className="flex min-h-screen items-center justify-center bg-monochrome-black">
      <NavBar variant="transparent" />
      <section className="container h-body w-full">
        <p className="text-monochrome-white">Hellow orld..</p>
      </section>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
