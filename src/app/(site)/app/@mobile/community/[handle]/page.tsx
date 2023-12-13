import { fetchCommunityDetails } from '@lib/api/community'
import { cookies } from 'next/headers'
import { MainComponent } from './main-component'
import { type Metadata } from 'next'

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

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const communityData = await fetchCommunityDetails(params.handle)
//   const title = `${communityData.info.name}`
//   const desc = `${communityData.info.description}`

//   return {
//     title,
//     applicationName: 'Genuin',
//     description: desc || '',
//     openGraph: {
//       title,
//       description: desc,
//       url: `${process.env.NEXT_PUBLIC_HOST_URL}/c/${params.handle}`,
//       images: [
//         { url: communityData.info.preview_image }
//       ]
//     },
//   }
// }
