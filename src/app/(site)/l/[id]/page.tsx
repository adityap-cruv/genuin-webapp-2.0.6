import { fetchLoopDetails } from '@lib/api/loop'
import { MainComponent } from './main-component'

interface Props {
  params: {
    id: string
  }
  searchParams: {}
}

export default async function Component({ params }: Props) {
  const loopDetails = await fetchLoopDetails(params.id)
  return <MainComponent loopDetails={loopDetails} />
}
