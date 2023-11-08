import { fetchLoopDetails } from '@lib/api/loop'
import { MainComponent } from './main-component'
import { cookies } from 'next/headers'

interface Props {
  params: {
    id: string
  }
  searchParams: {}
}

export default async function Component({ params }: Props) {
  const isMobile = cookies().get('mobile')?.value === 'true'
  const loopDetails = await fetchLoopDetails(params.id)
  return <MainComponent loopDetails={loopDetails} isMobile={isMobile} />
}
