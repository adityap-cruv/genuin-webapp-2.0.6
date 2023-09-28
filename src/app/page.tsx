import { Metadata } from 'next'
import { getServerSession } from 'next-auth'

export default async function Page() {
  const session = await getServerSession()
  return <section className="flex min-h-screen items-center justify-center"></section>
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
