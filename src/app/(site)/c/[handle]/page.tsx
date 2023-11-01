import { fetchCommunityDetails } from '@lib/api/community'
import { cookies } from 'next/headers'
import { MainComponent } from './main-component'

interface Props {
  params: {
    handle: string
  }
  searchParams: {}
}

export default async function Component({ params }: Props) {
  const communityData = await fetchCommunityDetails(params.handle)
  const mobileCookie = cookies().get('mobile')?.value
  return <MainComponent communityDetails={communityData} isMobile={mobileCookie === 'true'} />
}
