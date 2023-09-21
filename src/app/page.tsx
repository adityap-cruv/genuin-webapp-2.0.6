import { MainComponent } from '@components/home/mainComponent'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import Head from 'next/head'

export default async function Page({ props }: { props: any }) {
  const session = await getServerSession()
  return (
    <section className="flex min-h-screen flex-col items-center justify-center">
      <MainComponent />
    </section>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
