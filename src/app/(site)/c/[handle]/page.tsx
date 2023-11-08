import { fetchCommunityDetails } from '@lib/api/community'
import { cookies } from 'next/headers'
import { MainComponent } from './main-component'
import { Metadata } from 'next'

interface Props {
  params: {
    handle: string
  }
  searchParams: {
    details: string
  }
}

export default async function Component({ params, searchParams }: Props) {
  const communityData = await fetchCommunityDetails(params.handle)
  const mobileCookie = cookies().get('mobile')?.value
  return (
    <MainComponent
      communityDetails={communityData}
      isMobile={mobileCookie === 'true'}
      showDetailsPage={searchParams.details === 'true'}
    />
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const communityData = await fetchCommunityDetails(params.handle)
  const title = `${communityData.info.name}`
  let desc = `${communityData.info.description}`

 
  return {
    title: title,
    applicationName: 'Genuin',
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/c/${params.handle}`,
    },
  }
}