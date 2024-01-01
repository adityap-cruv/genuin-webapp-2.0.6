import { fetchCommunityDetails } from '@lib/api/community'
import { RootFeed } from './root-feed'
import { RootDetails } from './root-details'

type Props = {
  params: {
    handle: string
  }
  searchParams: {
    feed: string
  }
}

export default async function Component({ params, searchParams }: Props) {
  if (searchParams.feed === '1') return <RootFeed handle={params.handle} />
  return <Details handle={params.handle} />
}

async function Details({ handle }: { handle: string }) {
  const communityData = await fetchCommunityDetails(handle)
  return <RootDetails communityDetails={communityData} />
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
