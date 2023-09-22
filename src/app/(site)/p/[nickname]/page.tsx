import { Metadata } from 'next'
import { MainComponent } from './mainComponent'
import { cookies } from 'next/headers'
import { getUserData } from '@/lib/api/profile'
// import { checkIfMobile } from '@/lib/utils'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: {}
}

export default async function Component({ params }: CompProps) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  const profileData = await getUserData(params.nickname)
  return (
    <section className="absolute h-full w-full">
      <MainComponent mobile={isMobile} profileData={profileData} />
    </section>
  )
}

export async function generateMetadata({ params }: { params: { nickname: string } }): Promise<Metadata> {
  // const data = await getUserData(params.nickname)
  return { title: 'himanshu' }
}
