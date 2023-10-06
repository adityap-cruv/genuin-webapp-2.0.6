import { MainComponent } from './main-component'
import { fetchVideoDetails } from '@lib/api/video'

interface PageProps {
  params: {
    id: string
  }
  searchParams: {
    l: string
  }
}

export default async function Component({ params, searchParams }: PageProps) {
  const videoData = await fetchVideoDetails(params.id)

  return <MainComponent videoData={videoData} />
}
