import { fetchLoopDetails } from '@lib/api/loop'
import { MainComponent } from './main-component'
import { type Metadata } from 'next'

interface Props {
  params: {
    id: string
  }
  searchParams: Record<string, unknown>
}

export default async function Component({ params }: Props) {
  const loopDetails = await fetchLoopDetails(params.id)
  return <MainComponent loopDetails={loopDetails}/>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loopDetails = await fetchLoopDetails(params.id)
  const group = loopDetails.group
  const ldDescription = `${
    group?.group_description !== null &&
    group.group_description !== undefined &&
    group.group_description.replace(/\s+/g, '') !== ''
      ? group.group_description + ' | '
      : ''
  } Join ${group?.group_name} to talk about it` //! consider "it" as temporary var will have to change once api gives categories in response.

  const title = group?.group_name
  return {
    title,
    applicationName: 'Genuin',
    description: ldDescription,
    openGraph: {
      title,
      description: ldDescription,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/l/${params.id}`,
      images: [
        {
          url: loopDetails.preview_image,
        },
      ],
    },
  }
}
