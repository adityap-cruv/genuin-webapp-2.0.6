import { type Metadata } from 'next'
import { MainComponent } from './main-component'
import { fetchQuestionDetails } from '@lib/api/question'

interface Props {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<Record<string, unknown>>
}

export default async function Component({ params }: Props) {
  const resolvedParams = await params
  const questionDetails = await fetchQuestionDetails(resolvedParams.id)
  return <MainComponent questionDetails={questionDetails} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const questionDetails = await fetchQuestionDetails(resolvedParams.id)
  const title = `Answer '${questionDetails.question}' on Genuin | Reach billions of people with your expert advice.`
  const desc = 'Answer this trending question on Genuin'

  return {
    title,
    applicationName: 'Genuin',
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/q/${questionDetails.question_id}`,
      images: [
        {
          url: questionDetails.preview_image,
        },
      ],
    },
  }
}
