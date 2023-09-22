import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'

export default async function Page({ props }: { props: any }) {
  const session = await getServerSession()
  return <section className="flex min-h-screen items-center justify-center"></section>
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
