import { Metadata } from 'next'
import { MainComponent } from './main-component'
import { fetchQuestionDetails } from '@lib/api/question'

interface Props {
  params: {
    id: string
  }
  searchParams: {}
}

export default async function Component({ params }: Props) {
  const questionDetails = await fetchQuestionDetails(params.id)
  return <MainComponent questionDetails={questionDetails} />
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const questionDetails = await fetchQuestionDetails(params.id)
  const title = `Answer '${questionDetails.question}' on Genuin | Reach billions of people with your expert advice.`
  const desc = 'Answer this trending question on Genuin'

  return {
    title: title,
    applicationName: 'Genuin',
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/q/${questionDetails.question_id}`,
      images: [
        {
          url: questionDetails.preview_image
        },
      ],
    },
  }
}