import { fetchCommunityDetails } from '@lib/api/community'
import { MainComponent } from './main-component'

interface Props {
  params: {
    handle: string
  }
  searchParams: {}
}

export default async function Component({ params }: Props) {
  const communityData = await fetchCommunityDetails(params.handle)
  return <MainComponent communityData={communityData} />
}
