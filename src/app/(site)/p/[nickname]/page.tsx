import { Metadata } from 'next'
import { MainComponent } from './main-component'
import { cookies } from 'next/headers'
import { fetchUserData } from '@lib/api/profile'

interface CompProps {
  params: {
    nickname: string
  }
  searchParams: {}
}

export default async function Component({ params }: CompProps) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  const profileData = await fetchUserData(params.nickname)
  return <MainComponent profileData={profileData} />
}

export async function generateMetadata({ params }: CompProps): Promise<Metadata> {
  // const data = await getUserData(params.nickname)
  return { title: 'Welcome to Genuin!!!' }
}
