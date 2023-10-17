import { NavBar } from '@components/common/nav-bar'
import { Metadata } from 'next'
import Image from 'next/image'
import { HomeComponent } from './home-component'
import backgroundVectorImg from '@images/backgroundVector.svg'

export default async function Page() {
  return (
    <main className=" absolute inset-0 h-full w-full overflow-clip bg-monochrome-black">
      <NavBar variant="transparent" />
      <section className="mt-navbar h-body w-full">
        <Image src={backgroundVectorImg} alt="genuin" className="absolute inset-0 top-[17%] h-5/6 w-full" />
        <HomeComponent />
      </section>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Welcome to Genuin!!!' }
}
